# Create T3 Clean Architecture Implementation

I implemented the clean architecture in the Create T3 App. The clean architecture is a software design philosophy that separates the software into layers.
The layers i implemented are the presentation layer,
use case layer, and entity(data) layer. The presentation layer is responsible for the UI and user interactions. in this case, the presentation layer is pages+trpc
The use case layer is responsible for the business logic.
is located at src/layer/use-cases.
The entity(data) layer is responsible for the entity(data) access.
is located at src/layer/entities

I also implemented a custom jwt authentication 

create .env file in the root directory and add the following variables. 
look .env.example for reference

# Install the dependencies


# run scripts
bun run re-create-db # to create the database and migrate the tables <br>

bun run init-db # to seed the database with some data

user:user@gmail.com password:user
admin:admin@gmail.com password:admin


# Run the app
bun run dev or pnpm run dev