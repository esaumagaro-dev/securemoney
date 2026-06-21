def test_register_and_login(client):
    rv = client.post("/api/auth/register", json={"email":"bob@example.com", "password":"StrongPass!1"})
    assert rv.status_code == 201
    rv2 = client.post("/api/auth/login", json={"email":"bob@example.com", "password":"StrongPass!1"})
    assert rv2.status_code == 200
    assert "access_token" in rv2.get_json()
