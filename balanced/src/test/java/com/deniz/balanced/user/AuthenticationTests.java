package com.deniz.balanced.user;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.deniz.balanced.framework.test.AbstractTransactionalTest;
import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.user.business.UserBusinessService;

public class AuthenticationTests extends AbstractTransactionalTest {

	@Autowired
	private AuthenticationBusinessService authenticationBusinessService;

	@Autowired
	private UserBusinessService userBusinessService;

	@Before
	public void checkSetupData() {
		// Setup Data Insertion has started first; so root data must exist
		int userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 1);
	}

	@Test
	public void testAuthentication() {

		try {
			this.authenticationBusinessService.signup("deniz", "1234qwer", "121", "denyo.a@gmail.com", "232234");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "PasswordNotMatchedException");
		}

		try {
			this.authenticationBusinessService.signup("ozgen", "1234qwer", "1234qwer", "denyo.a@gmail.com", "232234");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataAlreadyExistException");
		}

		try {
			this.authenticationBusinessService.signup("ozgen", "1234qwer", "1234qwer", "@gmail.com", "232234");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "EmailNotValidException");
		}

		try {
			this.authenticationBusinessService.signup("deniz", "1234qwer", "1234qwer", "deniz@gmail.com", "232234");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		try {
			this.authenticationBusinessService.signup("deniz", "1234qwer", "1234qwer", "ozgenerdem@hotmail.com", "AUJ34DEW");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataAlreadyExistException");
		}

		// No data should be inserted except Setup Data until now
		int userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 1);

		try {
			this.authenticationBusinessService.signup("deniz", "1234qwer", "1234qwer", "denizyavas@hotmail.com", "AUJ34DEW");
		} catch (Exception e) {
			Assert.fail();
		}

		userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 2);

	}

}
