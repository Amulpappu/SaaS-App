from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models import User, Subscription, Payment, ActivityLog
from auth import get_current_user

router = APIRouter()

@router.get("/metrics")
def get_analytics_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # To keep this simple we allow any user to see "their" stats, but an admin sees global stats.
    # For a real SaaS, maybe these are global platform metrics restricted to admins, or specific to the user's team.
    # Here we'll return mock global stats if admin, otherwise personal stats.
    
    if current_user.is_admin:
        total_users = db.query(User).count()
        active_subs = db.query(Subscription).filter(Subscription.status == "active").count()
        total_revenue = db.query(func.sum(Payment.amount)).scalar() or 0
        
        # Monthly revenue mock data for charts
        revenue_data = [
            {"name": "Jan", "revenue": 400},
            {"name": "Feb", "revenue": 800},
            {"name": "Mar", "revenue": 1200},
            {"name": "Apr", "revenue": 1600},
            {"name": "May", "revenue": 2200},
            {"name": "Jun", "revenue": 2800},
        ]
        
        return {
            "total_users": total_users,
            "active_subscriptions": active_subs,
            "total_revenue": total_revenue,
            "chart_data": revenue_data
        }
    else:
        # Personal stats dummy
        my_activities = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).count()
        return {
            "total_users": 1,
            "active_subscriptions": 1 if current_user.subscription and current_user.subscription.status == 'active' else 0,
            "total_revenue": 0,
            "chart_data": [
                 {"name": "Mon", "activity": 2},
                 {"name": "Tue", "activity": 5},
                 {"name": "Wed", "activity": 1},
                 {"name": "Thu", "activity": 8},
                 {"name": "Fri", "activity": 4},
                 {"name": "Sat", "activity": 0},
                 {"name": "Sun", "activity": 0},
            ]
        }
