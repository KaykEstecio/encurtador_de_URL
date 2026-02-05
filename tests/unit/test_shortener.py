from app.services.shortener import create_unique_random_key

def test_create_unique_random_key():
    key = create_unique_random_key(length=6)
    assert len(key) == 6
    assert key.isalnum()

def test_randomness():
    key1 = create_unique_random_key()
    key2 = create_unique_random_key()
    assert key1 != key2
