package com.deniz.balanced.mission;

import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.framework.test.AbstractTransactionalTest;
import com.deniz.balanced.mission.business.MissionBusinessService;
import com.deniz.balanced.mission.business.domain.MissionDto;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import junit.framework.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.List;

public class MissionTests extends AbstractTransactionalTest {

	@Autowired
	private MissionBusinessService missionBusinessService;

	@Autowired
	private AuthenticationBusinessService authenticationBusinessService;

	@Autowired
	private UserBusinessService userBusinessService;

	@Autowired
	private UserBackendService userBackendService;

	/**
	 * Add test users
	 * 
	 */
	@Before
	public void setup() {
		try {
			this.authenticationBusinessService.signup("deniz", "123", "123", "denizyavas@hotmail.com", "AUJ34DEW");
			this.authenticationBusinessService.signup("yucel", "123", "123", "yucel@hotmail.com", "AUJ34DEW");

			UserDto user = this.userBusinessService.getByName("yucel");
			this.authenticationBusinessService.signup("baris", "123", "123", "baris@hotmail.com", user.getReferenceMeta().getValue());
		} catch (AncestorInviteLimitReachedException e) {
			Assert.assertTrue(true);
		} catch (Exception e) {
			Assert.fail();
		}
	}

	@Test
	public void testMissions() {
		Assert.assertEquals(this.missionBusinessService.getCount(), 0);

		try {
			this.missionBusinessService.getByName("nomission");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		List<MissionDto> validMissions = this.missionBusinessService.getValidMissions(new Date());
		Assert.assertEquals(validMissions.size(), 0);
	}

	@Test
	public void testExperience() throws NotValidIdException {
		MissionDto missionDto = new MissionDto();
		missionDto.getSimpleNameMeta().setValue("TWIT12");
		missionDto.getDescriptionMeta().setValue("Do this tweet and get experience");
		missionDto.getExpertiseMeta().setValue("EASY");
		missionDto.getValidFromMeta().setValue("6.1.2013 00:00:00");
		missionDto.getValidToMeta().setValue("1.1.2014 01:12:31");
		try {
			this.missionBusinessService.addMission(missionDto);
		} catch (DataAlreadyExistException e) {
			Assert.fail();
		}

		Assert.assertEquals(this.missionBusinessService.getCount(), 1);

		try {
			this.missionBusinessService.completeMissionForUser("", "TWIT12");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		try {
			this.missionBusinessService.completeMissionForUser("baris", "");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "DataNotExistException");
		}

		try {
			UserDto missionCompletingUser = this.userBusinessService.getByName("baris");

			UserDto ancestorLevelOne = this.userBusinessService.getPrimaryAncestor("baris");

			UserDto ancestorLevelTwo = this.userBusinessService.getPrimaryAncestor(ancestorLevelOne.getSimpleNameMeta().getValue());

			Double initialExpCompletingUser = experienceAsLong(missionCompletingUser);
			Double initialExpAncestorOne = experienceAsLong(ancestorLevelOne);
			Double initialExpAncestorTwo = experienceAsLong(ancestorLevelTwo);
			try {
				this.missionBusinessService.completeMissionForUser("baris", "TWIT12");
			} catch (Exception e) {
				Assert.fail();
			}

			missionCompletingUser = this.userBusinessService.getByName("baris");

			ancestorLevelOne = this.userBusinessService.getPrimaryAncestor("baris");

			ancestorLevelTwo = this.userBusinessService.getPrimaryAncestor(ancestorLevelOne.getSimpleNameMeta().getValue());

			Assert.assertEquals((experienceAsLong(missionCompletingUser) - initialExpCompletingUser) > 0, true);
			Assert.assertEquals((experienceAsLong(ancestorLevelOne) - initialExpAncestorOne) > 0.0, true);
			Assert.assertEquals((experienceAsLong(ancestorLevelTwo) - initialExpAncestorTwo) > 0.0, true);

		} catch (DataNotExistException e) {
			Assert.fail();
		}

		try {
			this.missionBusinessService.completeMissionForUser("baris", "TWIT12");
			Assert.fail();
		} catch (Exception e) {
			Assert.assertEquals(e.getClass().getSimpleName(), "MissionAlreadyCompletedException");
		}
	}

	@Test
	public void testExperiencedUsers() throws DataNotExistException, DataAlreadyExistException, NotValidIdException {

		UserEntity secondAncestor = new UserEntity();
		secondAncestor.setAncestor(this.userBackendService.getByName("ozgen"));
		secondAncestor.setEmail("second@ancestor.com");
		secondAncestor.setExperience(60000.0);
		secondAncestor.setReferenceString("REFERENCE1");
		secondAncestor.setSimpleName("SECONDANCESTOR");
		secondAncestor.setBalance(0.0);
		secondAncestor.setPassword("123123");

		this.userBackendService.save(secondAncestor);

		UserEntity firstAncestor = new UserEntity();
		firstAncestor.setAncestor(this.userBackendService.getByName("SECONDANCESTOR"));
		firstAncestor.setEmail("first@ancestor.com");
		firstAncestor.setExperience(8005.0);
		firstAncestor.setReferenceString("REFERENCE2");
		firstAncestor.setSimpleName("FIRSTANCESTOR");
		firstAncestor.setBalance(0.0);
		firstAncestor.setPassword("123123");

		this.userBackendService.save(firstAncestor);

		UserEntity missionUser = new UserEntity();
		missionUser.setAncestor(this.userBackendService.getByName("FIRSTANCESTOR"));
		missionUser.setEmail("mission@user.com");
		missionUser.setExperience(10.0);
		missionUser.setReferenceString("REFERENCE3");
		missionUser.setSimpleName("missionUser");
		missionUser.setBalance(0.0);
		missionUser.setPassword("123123");

		this.userBackendService.save(missionUser);

		MissionDto missionDto = new MissionDto();
		missionDto.getSimpleNameMeta().setValue("TWIT12");
		missionDto.getDescriptionMeta().setValue("Do this tweet and get experience");
		missionDto.getExpertiseMeta().setValue("EASY");
		missionDto.getValidFromMeta().setValue("6.1.2013 00:00:00");
		missionDto.getValidToMeta().setValue("1.1.2014 01:12:31");
		this.missionBusinessService.addMission(missionDto);

		UserDto missionCompletingUser = this.userBusinessService.getByName("missionUser");

		UserDto ancestorLevelOne = this.userBusinessService.getPrimaryAncestor("missionUser");

		UserDto ancestorLevelTwo = this.userBusinessService.getPrimaryAncestor(ancestorLevelOne.getSimpleNameMeta().getValue());

		Double initialExpCompletingUser = experienceAsLong(missionCompletingUser);
		Double initialExpAncestorOne = experienceAsLong(ancestorLevelOne);
		Double initialExpAncestorTwo = experienceAsLong(ancestorLevelTwo);
		try {
			this.missionBusinessService.completeMissionForUser("missionUser", "TWIT12");
		} catch (Exception e) {
			Assert.fail();
		}

		missionCompletingUser = this.userBusinessService.getByName("missionUser");

		ancestorLevelOne = this.userBusinessService.getPrimaryAncestor("missionUser");

		ancestorLevelTwo = this.userBusinessService.getPrimaryAncestor(ancestorLevelOne.getSimpleNameMeta().getValue());

		double missionUserXp = experienceAsLong(missionCompletingUser) - initialExpCompletingUser;
		double ancestorLevelOneXp = experienceAsLong(ancestorLevelOne) - initialExpAncestorOne;
		double ancestorLevelTwoXp = experienceAsLong(ancestorLevelTwo) - initialExpAncestorTwo;
		Assert.assertEquals(missionUserXp > 0, true);
		Assert.assertEquals(ancestorLevelOneXp > 0.0, true);
		Assert.assertEquals(ancestorLevelTwoXp > 0.0, true);

	}

	private Double experienceAsLong(UserDto user) {
		return Double.parseDouble(user.getExperienceMeta().getValue());
	}
}
