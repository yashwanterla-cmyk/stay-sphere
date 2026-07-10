from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.models import Expense, User, Property
from app.schemas.schemas import ExpenseOut, ExpenseCreate
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    property_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    query = db.query(Expense)
    
    if property_id:
        query = query.filter(Expense.property_id == property_id)
    if category:
        query = query.filter(Expense.category == category)
        
    return query.all()

@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    prop = db.query(Property).filter(Property.id == expense_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db_expense = Expense(
        property_id=expense_in.property_id,
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description,
        receipt_url=expense_in.receipt_url
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return {"message": "Expense record deleted successfully"}
