package com.deniz.balanced.business.enums;

public enum ExperienceRatioEnum {
	EASY(1), MEDIUM(2), HARD(3);

	private int degree;

	private ExperienceRatioEnum(int degree) {
		this.degree = degree;
	}

	public int getDegree() {
		return this.degree;
	}

}
