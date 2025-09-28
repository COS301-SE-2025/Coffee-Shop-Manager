# Makefile for running Playwright tests

.PHONY: all login signup test

all: test

testint:
# 	npx playwright test tests/intsignup.spec.ts && \
	
	
# 	npx playwright test tests/intlogin.spec.ts  && \
#  	npx playwright test tests/intGetTests.spec.ts


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
# 	@$(MAKE) getAdminTest
# 	@$(MAKE) posTest
	@$(MAKE) managerTest



# 	npx playwright test tests/signup.spec.ts && \

# 	npx playwright test tests/working/login.spec.ts && \

# 	npx playwright test tests/getTestAdmin.spec.ts

# 	npx playwright test tests/working/postTestAdminPOS.spec.ts && \
 
# 	npx playwright test tests/working/postTestAdminManager.spec.ts

# 	npx playwright test tests/getTestUser.spec.ts && \

# 	npx playwright test tests/postTestUser.spec.ts

test:
	make teste2e