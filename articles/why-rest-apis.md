# Why REST APIs Exist

## Overview
Representational State Transfer (REST) is an architectural style for designing networked applications. Created by Roy Fielding in his 2000 PhD dissertation, REST defines a set of constraints that, when followed, result in highly scalable, stateless, and cacheable web services.

## Why it matters
Virtually the entire modern web operates via APIs. Whether you are building a React frontend, an iOS app, or integrating with Stripe, understanding REST ensures you build resilient systems that other developers can easily consume.

## How it works

A true REST API must adhere to six architectural constraints:

### 1. Client-Server Architecture
The client (frontend/mobile app) and the server (backend/database) are entirely separate. They communicate exclusively over an interface (HTTP).

### 2. Statelessness
This is arguably the most important rule. **No client context is stored on the server between requests.** Every single request from the client must contain all the information the server needs to understand and process it (e.g., authentication tokens in the headers).

> [!TIP]
> Statelessness allows APIs to scale infinitely. If the server doesn't need to remember who you are between requests, you can distribute traffic across thousands of servers using a load balancer.

### 3. Cacheability
Responses must explicitly state whether they can be cached or not. If cacheable, clients (or intermediary CDNs) can reuse the response data for subsequent equivalent requests, saving server load.

### 4. Uniform Interface
Resources should be identifiable via URIs, and manipulated using standard HTTP methods:
- `GET` /users (Retrieve data)
- `POST` /users (Create data)
- `PUT` /users/123 (Replace data)
- `PATCH` /users/123 (Update partial data)
- `DELETE` /users/123 (Remove data)

## Example

**Bad API Design (RPC Style):**
```http
POST /api/createUser
POST /api/updateUserName?id=123
POST /api/deleteUser?id=123
```

**Good RESTful Design:**
```http
POST /api/users          (Create user)
PATCH /api/users/123     (Update user 123)
DELETE /api/users/123    (Delete user 123)
```

## Best Practices
- **Use Nouns, Not Verbs**: Endpoints should represent resources (nouns like `/books`), not actions. The action is defined by the HTTP method.
- **Pluralize Resource Names**: Use `/users` instead of `/user`. It maintains consistency when fetching lists vs. single items.
- **Return standard HTTP Status Codes**: 
  - `200 OK` (Success)
  - `201 Created` (Resource created)
  - `400 Bad Request` (Client sent bad data)
  - `401 Unauthorized` (Missing/invalid auth)
  - `404 Not Found` (Resource doesn't exist)
  - `500 Internal Server Error` (Your code crashed)

## Common Mistakes
- ❌ Returning a `200 OK` status code when an error occurs, but putting `"error": true` in the JSON body. Always use proper HTTP status codes.
- ❌ Using `GET` requests to modify data in the database. `GET` must be idempotent (safe to call multiple times without changing state).

## Further Reading
- [Roy Fielding's Dissertation on REST](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [Stripe API Documentation](https://stripe.com/docs/api) (A gold standard for REST API design)
