def test_transfer_insufficient(client, app):
    client.post("/api/auth/register", json={"email":"a@example.com","password":"P@ssw0rd"})
    client.post("/api/auth/register", json={"email":"b@example.com","password":"P@ssw0rd"})
    r = client.post("/api/auth/login", json={"email":"a@example.com","password":"P@ssw0rd"})
    token = r.get_json().get("access_token")
    rv = client.post("/api/user/transfer", json={"from_wallet": "nonexistent", "to_wallet": "nonexistent", "amount": "10"}, headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code == 400
