import unittest

from app.schemas.schemas import TenantRegister


class TenantRegistrationSchemaTests(unittest.TestCase):
    def test_tenant_register_accepts_manual_room_bed_and_fee(self):
        payload = TenantRegister(
            email="tenant@example.com",
            full_name="Jane Doe",
            phone="1234567890",
            password="secret123",
            room_number="101",
            bed_number="101-A",
            fee=2500.0,
        )

        self.assertEqual(payload.room_number, "101")
        self.assertEqual(payload.bed_number, "101-A")
        self.assertEqual(payload.fee, 2500.0)


if __name__ == "__main__":
    unittest.main()
