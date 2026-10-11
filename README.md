# coffeeTracker

A webapp that tracks the coffee supply of an office :)

## Features

- User account registration without any permission
  - First user to register automatically becomes the admin
  - Everyone else has to be approved by the admin if the account wasn’t created from the admin dashboard
- The whole system works based on pools, every coffee machine at an office is considered a pool, each of them have a separate transaction list. Every user has a different balance for all of them!
- Clear UI with big buttons for the four main functions
  - Drink (“Ivás”): The user can either choose a predefined strength of coffee or can enter a custom amount in gramms, people can only drink from a pool if the user has enough money to pay for the coffee and the pool has enough coffee to drink from
  - Add coffee (“Kávé hozzáadása”): The user can register coffee that they bought with their own money!. They need to enter the amount and cost of it!
  - Add money (“Pénz hozzáadása”): The user can register a money only transaction, the system treats it differently to a coffee add transaction, since it doesn’t physically add coffee to the pool
  - Use Money (“Pénz felhasználása”): Since the system treats money only and coffee transactions this serves the function of using up the funds from money only transactions in the pool!
- Any transaction can be edited: Users can only edit their transactions for a limited time, while admins can edit all transactions at any point in time right from the dashboard!
- Profile pictures: Any user can set a profile picture, it has no usefulness, but it’s fun. Admins can administer profile pics to any user these pictures can also be removed!

## How to run:

```
git clone https://github.com/FonixPython/coffeeTracker
cd coffeeTracker
npm i
npx prisma generate
npx primsa migrate dev
npm run build
npm run start
```
(or use npm run dev for development)

## Tech stack
- React
- React router dom
- Express.js
- Prisma ORM
