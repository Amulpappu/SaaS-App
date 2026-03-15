import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import User, Subscription, SubscriptionPlan, ActivityLog
from auth import get_current_user

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_123")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_123")

class CheckoutSessionRequest(BaseModel):
    plan: SubscriptionPlan

@router.post("/create-checkout-session")
def create_checkout_session(
    request: CheckoutSessionRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Depending on plan, map to Stripe price ID
    price_id_map = {
        SubscriptionPlan.PRO: os.getenv("STRIPE_PRICE_PRO", "price_pro_123"),
        SubscriptionPlan.ENTERPRISE: os.getenv("STRIPE_PRICE_ENTERPRISE", "price_ent_123"),
    }
    
    if request.plan not in price_id_map:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    try:
        # Create or retrieve Stripe Customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={'user_id': current_user.id}
            )
            current_user.stripe_customer_id = customer.id
            db.commit()

        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id_map[request.plan],
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/billing?success=true",
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/billing?canceled=true",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-subscription")
def get_my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.subscription:
        return {"plan": SubscriptionPlan.FREE, "status": "active"}
    return {
        "plan": current_user.subscription.plan,
        "status": current_user.subscription.status,
        "current_period_end": current_user.subscription.current_period_end
    }

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            # Create or update subscription record
            sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
            if not sub:
                sub = Subscription(user_id=user.id)
                db.add(sub)
                
            sub.stripe_subscription_id = subscription_id
            sub.status = "active"
            # we'd normally fetch the sub from Stripe to get the plan/end_date accurately
            # sub.plan = SubscriptionPlan.PRO 
            db.commit()
            
            # Log it
            log = ActivityLog(user_id=user.id, action="subscription_created", details=subscription_id)
            db.add(log)
            db.commit()

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        sub_id = subscription.get('id')
        sub = db.query(Subscription).filter(Subscription.stripe_subscription_id == sub_id).first()
        if sub:
            sub.status = "canceled"
            sub.plan = SubscriptionPlan.FREE
            db.commit()
            log = ActivityLog(user_id=sub.user_id, action="subscription_canceled", details=sub_id)
            db.add(log)
            db.commit()

    return {"status": "success"}
