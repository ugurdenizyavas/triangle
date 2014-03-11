package com.deniz.framework.dto;

/**
 * Base class for all Dto objects.
 * <p/>
 * 
 * @author Deniz Yavas
 */
public abstract class AbstractDto {
	public static final String BUSINESS_KEY_PREFIX = "#";

	private String id;

	private Meta simpleNameMeta = new Meta();

	public Meta getSimpleNameMeta() {
		return simpleNameMeta;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = convertEmpty(id);
	}

	/**
	 * Semantically, <tt>null</tt>, "" etc. are identical.
	 * <p/>
	 * <p>
	 * This method converts these values to <tt>null</tt>. All other values
	 * remain untouched.
	 * 
	 * @param value
	 *            The original value to check for null equivalent values
	 * @return <tt>null</tt> if <tt>null</tt>, "" or the value "empty.none" were
	 *         given. The original value otherwise.
	 */
	protected String convertEmpty(String value) {
		if (value == null || value.length() == 0 || value.equals("empty.none")) {
			return null;
		}
		return value;
	}

	public String getInfo() {
		return simpleNameMeta.getValue();
	}

}
