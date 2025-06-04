from datetime import datetime

class User:
    def __init__(self, id, email, password, profile_type):
        self.id = id
        self.email = email
        self.password = password  # Should be hashed
        self.profile_type = profile_type
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def __repr__(self):
        return f"<User {self.email}>"

# Example usage (conceptual):
# new_user = User(id=1, email='test@example.com', password='hashed_password', profile_type='freelance')
