# JavaScript Backend Assignment

FHSU INF653 Web Backend Final Project: 

## Assignment Notes
- MongoDB uses _id for the ID key, this code reflects using _id vs id in the API.
- the .env file contains PORT=xxxx and MONGOURI="mongodb+srv://un:pw@cluster0.mongodb.net/studentDB?retryWrites=true&w=majority&appName=Cluster0"
- no default route or web pages were included in this assignment per the assignment requirements.

## Development Environment

### Docker
Development for new projects requires many dependencies, and if you complete may projects, the dependencies will overlap or use the wrong versions, so by developing in a docker container, all the dependencies for each project are kept separate. For this project, I am using the node:latest container image, with the docker compose file below. I use Portainer to manage all my containers running across a few different computers, and use Portainer's attach console to get cli access to the container.

### Networking
This project's docker container is running on my DMZ VLAN, with a docker internal bridge network between the node.js container and the MongoDB container. This design makes the MongoDB database accessible only from the Node.js container and not from any outside networks. Traffic from the internet is being reverse proxied by Traefik, also running in a docker container, in the DMZ VLAN but on a separate server. For development, the node.js container needs outbound access to the internet so it can install npm packages. This is normally not allowed in the DMZ VLAN, and a NFTables firewall rule: 

```
define DMZ_inf653final = 10.0.20.12 #inf653final.int2117.jahartley.com.
chain forward { //skip to relevent rules...
    # DMZ exceptions
    ip saddr $DMZ_inf653final oifname $vlInternet accept
```
has been added to the forward chain, only during development.

### DNS
For this project to be reachable on the internet, a CNAME record was added to my external DNS provider. Internal DNS is provided by bind in another container.

### Reverse Proxy
This project is using Traefik for its reverse proxy, and for HTTPS, using a Traefik dynamic file provider, example below:

```yml
http:
  routers:
    inf653final:
      entryPoints:
        - websecureint
        - websecure
      rule: Host(`inf653final.jahartley.com`)
      service: inf653final
      tls:
        certResolver: leresolver
  services:
    inf653final:
      loadBalancer:
        servers:
          - url: "http://10.0.20.12:3000"
```

#### docker compose
Compose file explanation:
- working_dir: sets the working directory for node, use as bind point for bind folder
- volume bind: bind the directory your code is in into the working_dir
- stdin_open & tty: keeps the container running even if you disconnect the console
- command: the command the container runs after starting.

````yaml
services:
  nodejs:
    image: node:latest
    working_dir: /app
    networks:
      dipv20:
        ipv4_address: 10.0.20.12
      inf653final:
    volumes:
      - /store/Docs/School/Judson/FHSU/2025-1-Spring/INF653/INF653Final:/app
    stdin_open: true
    tty: true
    command: bash
    user: node
    environment:
      - NODE_ENV=production
      - NPM_CONFIG_PREFIX=/home/node/.npm-global
      - PATH=$PATH:/home/node/.npm-global/bin # optionally if you want to run npm global bin without specifying path
      - PATH=$PATH:./node_modules/.bin
      
  mongodb:
    image: mongodb/mongodb-community-server:latest
    networks:
      inf653final:
    volumes:
      - /store/Docs/School/Judson/FHSU/2025-1-Spring/INF653/INF653FinalDatabase:/data/db

networks:
  dipv20:
    external: true
  inf653final:
    internal: true
````

### NodeJS Debugger
Remember to use the built-in NodeJs debugger with one of the following cli flags:
- --inspect=[host:port] Enables the inspector agent.
- --inspect-brk=[host:port] Enable the inspector agent, break at first line of code
- --inspect-wait=[host:port] Enable the inspector agent, start code execution on debugging connection.

My development environment is on my local network and in a container (which doesn't know its address), and there is no public access to the container running NodeJS, so I specify --inspect-wait=[0.0.0.0], and connect that way. IF I was developing on a container exposed to the internet, the flags above specified without the =[host:port] portion default to localhost:9229, and I use ssh to connect, and set a tunnel: 

- ssh -L 9229:localhost:9229 usr@IP

## Assignment Requirements
Final Project Requirements

### 1. PROJECT:
You will build a Node.js REST API for an Event Ticketing System using Express and MongoDB.

### 2. DATA Requirement:
No static JSON file has been provided for this project. All data must be created independently, stored, managed, and tested in MongoDB.

### 3. DATA Requirement:
You will need to create the following MongoDB collections:

#### a. Users Collection:
Represented with a User.js model.

The schema must include:

- name: string, required
- email: string, required, unique
- password: string, required
- role: string, enum: ['user', 'admin'], default: 'user'

Complete in /models/User.js

#### b. Events Collection:
Represented with an Event.js model.

The schema must include:

- title: string, required
- description: string
- category: string
- venue: string
- date: Date, required
- time: string
- seatCapacity: number, required
- bookedSeats: number, default 0
- price: number, required

Complete in /models/Event.js

#### c. Bookings Collection:
Represented with a Booking.js model.

The schema must include:

- user: ObjectId (references User)
- event: ObjectId (references Event)
- quantity: number, required
- bookingDate: Date, default: Date.now
- qrCode: string (optional, for bonus feature)

Complete in /models/Booking.js

### 4. DEPLOYMENT Requirement:
You can deploy your project using a free Render.com, Cyclic.sh, Glitch.com, or Firebase.com account.

- a. You must use environment variables for sensitive configuration.  
Complete in /.env

- b. Do NOT include your .env file in your GitHub repository.  
Complete in /.gitignore

- c. you may edit environment variables directly in your deployment dashboard if needed.
Complete in N/A

### 5. ROOT URLs:
#### a. Your root project URL should follow this pattern:

https://your-project-name.onrender.com/ 

Complete via DNS, Traefik Config.
 
This will display a simple HTML welcome page.

Complete via /routes/rootRouter.js

#### b. The REST API root URL must begin with:

https://your-project-name.onrender.com/api/

All API routes should be organized under /api.

Complete via /index.js

#### c. A catch-all must be implemented for non-existent routes:

If Accept: text/html, return a 404 HTML page.
If Accept: application/json, return a JSON object: { "error": "404 Not Found" }.

Complete via /index.js

### 6. Your REST API must support the following GET requests:

| Request                  |  Response Description                               | REQ | Complete |
|--------------------------|-----------------------------------------------------|-----|----------|
| GET/api/events           |  Return all events                                  | 6.a | Y        |
| GET/api/events/:id       |  Return a single event’s details                    | 6.b | Y        |
| GET/api/events?category= |  Filter events by category (optional)               | 6.c | Y        |
| GET/api/events?date=     |  Filter events by date (optional, e.g. YYYY-MM-DD)  | 6.d | Y        |
| GET/api/bookings         |  Return all bookings for the logged-in user         | 6.e | Y        |
| GET/api/bookings/:id     |  Return a specific booking's detail (only for user) | 6.f | Y        |

Notes:

1. Query parameters are optional and can be used together.
2. These endpoints must return event data from MongoDB.
3. Filtering logic must be implemented server-side.

### 7. Your REST API must support the following POST requests:

| Request                |  Description                              | REQ | Complete |
|------------------------|-------------------------------------------|-----|----------|
| POST/api/auth/register |  Register a new user                      | 7.a | Y T      |
| POST/api/auth/login    |  Authenticate a user and return JWT token | 7.b | Y T      |
| POST/api/events        |  Create a new event (admin only)          | 7.c | Y        |
| POST/api/bookings      |  Book tickets for an event (user only)    | 7.d | Y        |

Notes:

1. Event bookings must validate seat availability.
2. When tickets are booked, update bookedSeats in the event document.
3. All authenticated routes must require a valid JWT token in the header.

### 8. Your REST API must support the following PUT requests:

| Request                |  Description                              | REQ | Complete |
|------------------------|-------------------------------------------|-----|----------|
| PUT/api/events/:id     | Update an event (admin only)              | 8.a | Y        |

Notes:

1. Admins can update any field except the _id.
2. Booked events should not allow updates to seatCapacity below bookedSeats.

### 9. Your REST API must support the following DELETE requests:

| Request                |  Description                              | REQ | Complete |
|------------------------|-------------------------------------------|-----|----------|
| DELETE/api/events/:id  | Delete an event (admin only)              | 9.a | Y        |

Notes:

1. If an event has bookings, deletion should either be prevented or associated bookings should be deleted.

### 10. BONUS FEATURES (Optional, Up to 20 points)

#### a. QR Code Generation
- On booking, generate a QR code (use qrcode npm package).
- Store the QR code as a base64 string or URL in the booking document.

#### b. Ticket Validation Endpoint
- Create a route: GET /api/bookings/validate/:qr
- Validate the ticket based on the QR string.

#### c. Email Confirmation
- Send a booking confirmation email (use nodemailer).

#### d. Admin Dashboard Route
- Return all events with a list of users who booked each event.

### 11. GitHub Repository & Submission

#### a. Push your code to a GitHub repository

#### b. You don't need to include the .env file in your repo.

#### c. Submit the following via Blackboard:

- A link to your deployed API (Render, Cyclic, or Glitch)
- A link to your GitHub repo
- A Video presentation showing how your application works (5-10 minutes)

#### d. A one-page PDF titled final_project_reflection.pdf: 

- a. What did you learned from building it 
- b. The most challenging part of the project

### 12. Final Checklist
- All endpoints must be tested using Postman or Thunder Client
- The deployed app is working and accessible
- .env.example file provided in GitHub repo
- The code is modular and well-documented
- Final reflection PDF submitted


## API Test Data
Event Venues:
| Location | Seats |
|----------|-------|
| United Wireless Arena | 5300 |
| Charles Koch Arena | 11475 |
| Orpheum Theatre | 1286 |
| Hutchinson Memorial Hall | 2331 |
| Tony's Pizza Events Center | 7000 |
| Landon Arena | 9650 |
| Bob's Diner | 7 |

Bands:
Sting Daisies
Indigestible Pickers
The Twang Widower
Ambrosial Skid
Assemblage Nor
Mayonnaise Sensory

Categories:
Heavy Metal
Jazz
Folk
Punk Rock
Pop
Country

Judson Hartley 20250507

