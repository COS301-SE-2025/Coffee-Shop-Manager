# Makefile for running Playwright tests

.PHONY: all login signup test

all: test

testint:
	npx playwright test tests/intsignup.spec.ts && \
	npx playwright test tests/intlogin.spec.ts && \
	npx playwright test tests/intGetTests.spec.ts





teste2e:
#  	npx playwright test tests/signup.spec.ts && \
	
# 	npx playwright test tests/login.spec.ts && \
	npx playwright test tests/getTestAdmin.spec.ts &&\
	npx playwright test tests/postTestAdmin.spec.ts && \
	npx playwright test tests/getTestUser.spec.ts && \
	
	npx playwright test tests/postTestUser.spec.ts

test:
	make testint
	make teste2e


