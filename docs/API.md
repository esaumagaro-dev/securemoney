# SecureMoney API

OpenAPI summary (skeleton)

openapi: 3.0.3
info:
  title: SecureMoney API
  version: "0.1.0"
servers:
  - url: http://localhost:8000/api
paths:
  /auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
                full_name:
                  type: string
                phone:
                  type: string
      responses:
        '201':
          description: Created

  /auth/login:
    post:
      summary: Login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
                mfa_token:
                  type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
