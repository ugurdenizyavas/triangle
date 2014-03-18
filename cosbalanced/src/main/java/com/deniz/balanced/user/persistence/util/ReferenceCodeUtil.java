package com.deniz.balanced.user.persistence.util;

public class ReferenceCodeUtil {

	/**
	 * Creates an alphanumeric random string for reference of user
	 * 
	 * @param length
	 *            length of the reference code
	 * @return reference code
	 */
	public static String createReferenceCode(int length) {
		// include upper case alpha(a-z) and numbers(0-9)
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		int numberOfCodes = 0;// controls the length of alpha numberic string
		String code = "";
		while (numberOfCodes < length) {
			char c = chars.charAt((int) (Math.random() * chars.length()));
			code += c;
			numberOfCodes++;
		}
		return code;
	}

}
