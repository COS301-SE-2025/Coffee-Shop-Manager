# Makefile for running Playwright tests

.PHONY: all login signup test

# Run all tests
all: test

# Run login test
login:
	npx playwright test tests/login.spec.ts

# Run signup test
signup:
	npx playwright test tests/signup.spec.ts

# Run getOredrs test
getOrders:
	npx playwright test tests/getOrders.spec.ts

# Run all tests
test:
	npx playwright test tests/

