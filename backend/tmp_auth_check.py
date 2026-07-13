from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import User

client = TestClient(app)

db = SessionLocal()
db.query(User).delete()
db.commit()
db.close()

resp = client.post('/api/v1/auth/signup', json={
    'email': 'test@example.com',
    'password': 'secret123',
    'full_name': 'Test User',
    'role': 'owner',
    'phone': '1234567890'
})
print('signup', resp.status_code, resp.text)
resp2 = client.post('/api/v1/auth/login', data={'username': 'test@example.com', 'password': 'secret123'})
print('login', resp2.status_code, resp2.text)
