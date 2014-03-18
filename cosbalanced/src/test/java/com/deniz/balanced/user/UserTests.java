package com.deniz.balanced.user;

import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.business.ExperienceBackendService;
import com.deniz.balanced.framework.test.AbstractTransactionalTest;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class UserTests extends AbstractTransactionalTest {

	@Autowired
	private UserBusinessService userBusinessService;

	@Autowired
	private ExperienceBackendService experienceBackendService;

	@Autowired
	private AuthenticationBusinessService authenticationBusinessService;

	@Before
	public void checkSetupData() {
		// Setup Data Insertion has started first; so root data must exist
		int userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 1);

		try {
			this.authenticationBusinessService.signup("deniz", "1234qwer", "1234qwer", "denizyavas@hotmail.com", "AUJ34DEW");
			this.authenticationBusinessService.signup("yucel", "1234qwer", "1234qwer", "yucel@hotmail.com", "AUJ34DEW");

			UserDto user = this.userBusinessService.getByName("yucel");
			this.authenticationBusinessService.signup("baris", "1234qwer", "1234qwer", "baris@hotmail.com", user.getReferenceMeta().getValue());
		} catch (Exception e) {
			Assert.fail();
		}
		userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 4);
	}

	@Test
	public void testAncestors() {

		try {
			this.userBusinessService.getPrimaryAncestor("notExistingUser");
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		try {
			this.userBusinessService.getAncestors("notExistingUser");
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		try {
			UserDto ancestorOfBaris = this.userBusinessService.getPrimaryAncestor("baris");
			Assert.assertEquals(ancestorOfBaris.getSimpleNameMeta().getValue(), "yucel");
		} catch (Exception e) {
			Assert.fail();
		}

		try {
			List<UserDto> ancestorsOfBaris = this.userBusinessService.getAncestors("baris");
			Assert.assertEquals(ancestorsOfBaris.size(), 3);
		} catch (Exception e) {
			Assert.fail();
		}
	}

	@Test
	public void testExperience() {
		List<UserDto> allUsers = this.userBusinessService.getAll();
		for (UserDto userDto : allUsers) {
//			Assert.assertEquals(userDto.getExperienceMeta().getValue(), "0.0");
		}
	}

}
