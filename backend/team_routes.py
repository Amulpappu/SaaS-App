from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from database import get_db
from models import User, Team, TeamMember, TeamRole, ActivityLog
from auth import get_current_user

router = APIRouter()

class TeamCreate(BaseModel):
    name: str

class TeamResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    model_config = {"from_attributes": True}

class MemberResponse(BaseModel):
    id: int
    email: str
    role: TeamRole
    joined_at: datetime

@router.post("/", response_model=TeamResponse)
def create_team(team: TeamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_team = Team(name=team.name)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    
    # Make creator the owner
    membership = TeamMember(team_id=new_team.id, user_id=current_user.id, role=TeamRole.OWNER)
    db.add(membership)
    
    log = ActivityLog(user_id=current_user.id, action="team_created", details=team.name)
    db.add(log)
    
    db.commit()
    return new_team

@router.get("/", response_model=List[TeamResponse])
def get_my_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get all teams where current user is a member
    teams = db.query(Team).join(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    return teams

@router.get("/{team_id}/members", response_model=List[MemberResponse])
def get_team_members(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify membership
    membership = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this team")
        
    memberships = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    result = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "id": user.id,
            "email": user.email,
            "role": m.role,
            "joined_at": m.joined_at
        })
    return result

@router.post("/{team_id}/invite")
def invite_user(team_id: int, email: str, role: TeamRole = TeamRole.MEMBER, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify sender is owner/admin
    sender_mem = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == current_user.id).first()
    if not sender_mem or sender_mem.role == TeamRole.MEMBER:
        raise HTTPException(status_code=403, detail="Not authorized to invite to this team")
        
    invitee = db.query(User).filter(User.email == email).first()
    if not invitee:
        raise HTTPException(status_code=404, detail="User not found (must register first for this simple demo)")
        
    existing_mem = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == invitee.id).first()
    if existing_mem:
        raise HTTPException(status_code=400, detail="User already in team")
        
    new_mem = TeamMember(team_id=team_id, user_id=invitee.id, role=role)
    db.add(new_mem)
    db.commit()
    return {"message": "User invited successfully"}
