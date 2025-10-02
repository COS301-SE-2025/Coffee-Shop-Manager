# Makefile for running Playwright tests

.PHONY: all login signup test

all: test

testint:
# 	npx playwright test tests/intsignup.spec.ts && \
	
	
# 	npx playwright test tests/intlogin.spec.ts  && \
#  	npx playwright test tests/intGetTests.spec.ts

signuptest:
	@echo "Running login tests..."
	npx playwright test tests/working/signup.spec.ts

logintest:
	@echo "Running login tests..."
	npx playwright test tests/working/login.spec.ts


posTest:
	@echo "Running manager tests..."
	npx playwright test tests/working/postTestAdminPOS.spec.ts

managerTest:
	@echo "Running manager tests..."
	npx playwright test tests/working/postTestAdminManager.spec.ts

getAdminTest:
	@echo "Running GetAdmin tests..."
	npx playwright test tests/working/getTestAdmin.spec.ts

teste2e: logintest
# 	@$(MAKE) signuptest
	@$(MAKE) getAdminTest
# 	@$(MAKE) posTest
# 	@$(MAKE) managerTest

test_safe: logintest
	@$(MAKE) getAdminTest

test_unsafe: logintest
	@$(MAKE) posTest
	@$(MAKE) managerTest


createOrdesLoadTest:
	@echo "Running load test with k6..."
	k6 run load-tests/create_order_load.js

createOrdesLoadTestMultiple:
	@echo "Running load test with k6..."
	k6 run load-tests/create_order_load_multiple_users.js

getOrdesLoadTest:
	@echo "Running load test with k6..."
	k6 run load-tests/get_orders_load.js
getOrdesLoadTestMultiple:
	@echo "Running load test with k6..."
	k6 run load-tests/get_orders_load_multiple_users.js

getProductLoadTest:
	@echo "Running load test with k6..."
	k6 run load-tests/getProducts_load.js

getProductLoadTestMultiple:
	@echo "Running load test with k6..."
	k6 run load-tests/getProducts_load_multiple_users.js




load:
# 	@$(MAKE) createOrdesLoadTest
# 	@$(MAKE) getOrdesLoadTest
	@$(MAKE) getOrdesLoadTestMultiple
# 	@$(MAKE) createOrdesLoadTestMultiple
# 	@$(MAKE) getProductLoadTestMultiple
# 	@$(MAKE) getProductLoadTest

createOrdesStressTest:
	@echo "Running stress test with k6..."
	k6 run load_stress_testing/create_order_stress.js

getOrdersStressTest:
	@echo "Running stress test with k6..."
	k6 run load_stress_testing/get_orders_stress.js

getProductsStressTest:
	@echo "Running stress test with k6..."
	k6 run load_stress_testing/getProducts_stress.js

stress:
	@$(MAKE) createOrdesStressTest
	@$(MAKE) getOrdersStressTest
	@$(MAKE) getProductsStressTest




# 	npx playwright test tests/signup.spec.ts && \

# 	npx playwright test tests/working/login.spec.ts && \

# 	npx playwright test tests/getTestAdmin.spec.ts

# 	npx playwright test tests/working/postTestAdminPOS.spec.ts && \
 
# 	npx playwright test tests/working/postTestAdminManager.spec.ts

# 	npx playwright test tests/getTestUser.spec.ts && \

# 	npx playwright test tests/postTestUser.spec.ts

test:
	make teste2e