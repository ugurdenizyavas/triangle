package com.deniz.balanced.user.persistence.entity;

import com.deniz.balanced.user.persistence.util.ReferenceCodeUtil;
import com.deniz.framework.persistence.entity.AbstractEntity;

import javax.persistence.*;

@Entity
@Table(name = "USER_ENTITY", uniqueConstraints = { @UniqueConstraint(columnNames = { "simpleName" }), @UniqueConstraint(columnNames = { "email" }),
		@UniqueConstraint(columnNames = { "reference" }) })
@SequenceGenerator(name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "USER_SEQUENCE")
public class UserEntity extends AbstractEntity {

	private String password;
	private String email;
	private Double experience;
	private UserEntity ancestor;
	private Integer currentLevel;
	private Double balance;
	private String reference;

	/**
	 * This will only be used for root user; its reference code will be manually
	 * set
	 */
	public UserEntity() {
		setExperience(0.0);
		this.balance = 0.0;
	}

	public UserEntity(Integer lengthOfReference) {
		this.experience = 0.0;
		this.currentLevel = 1;
		this.balance = 0.0;
		createNewReference(lengthOfReference);
	}

	public void createNewReference(Integer lengthOfReference) {
		this.reference = ReferenceCodeUtil.createReferenceCode(lengthOfReference);
	}

	public String getPassword() {
		return this.password;
	}

	public String getEmail() {
		return this.email;
	}

	public Double getExperience() {
		return this.experience;
	}

	@OneToOne
	public UserEntity getAncestor() {
		return this.ancestor;
	}

	public Integer getCurrentLevel() {
		return this.currentLevel;
	}

	public Double getBalance() {
		return this.balance;
	}

	public String getReference() {
		return this.reference;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setExperience(Double experience) {
		Integer newLevel = calculateLevel(experience);
		setCurrentLevel(newLevel);
		this.experience = experience;
	}

	public void setAncestor(UserEntity ancestor) {
		this.ancestor = ancestor;
	}

	public void setCurrentLevel(Integer currentLevel) {
		this.currentLevel = currentLevel;
	}

	public void setBalance(Double balance) {
		this.balance = balance;
	}

	public void setReference(String reference) {
		this.reference = reference;
	}

	/**
	 * Calculates new level according to experience
	 * 
	 * @param newExperience
	 *            new experience
	 * @return new level
	 */
	public static int calculateLevel(Double experience) {
		if (experience < 100.0) {
			return 1;
		} else if (experience < 300.0) {
			return 2;
		} else if (experience < 500.0) {
			return 3;
		}
		Double result = (Math.sqrt(5) * Math.log(experience / 100)) / Math.log(3.14);
		return (int) Math.round(result);
	}
}
