package com.deniz.framework.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * <p/>
 * Represents one field e.g. to holt the <i>firstname<i> within a person object.
 * <p/>
 * <p>
 * A Meta consist of the actual value of the field plus warning and error
 * messages from the validation of this Meta.
 * <p/>
 * <p/>
 * The flag valueChanged can be used to signal that the value was changed and
 * that readers of Meta objects should update any GUI representation of the
 * value.
 * <p/>
 * <p>
 * Metas follow the <i>Data Transfer Objects</i> design pattern. Compared to the
 * classical <i>DTO</i> pattern, we embed the Metas into the persistent
 * entities. We think this approach makes it much easier to convert the Dto
 * representation to the entity representation especially if you have objects
 * that contain collections and you use inheritance at the same time for these
 * objects.
 * <p/>
 * <p>
 * The use of the DTO pattern is primarily motivated by centralizing all
 * validation logic as a business component. This avoids having some validation
 * logic (String -> Date conversion fails) in the service or presentation layer
 * and other logic like max number of allowed characters as annotation in your
 * entity.
 * <p/>
 * <p>
 * When the value of a Meta is set, some values that are semantically equivalent
 * to <tt>null</tt> like "" are normalized to <tt>null</tt>, see
 * {@link #convertEmpty(String)} for details.
 * <p/>
 * 
 * @author Deniz Yavas
 */
public class Meta implements Serializable {
	public static final String VALUE_TRUE = Boolean.toString(true);
	public static final String VALUE_FALSE = Boolean.toString(false);

	private ValueMode valueMode;
	private String value;
	private List<String> valueList;

	private boolean valueChanged;
	private ValueType valueType;

	private boolean locked;
	private boolean lockedChanged;

	private List<Message> warnings;
	private List<Message> errors;
	private List<Message> statuses;

	public enum ValueMode {
		SINGLE_VALUE, VALUE_LIST
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (!(o instanceof Meta))
			return false;

		Meta meta = (Meta) o;

		if (ValueMode.VALUE_LIST.equals(meta.getValueMode())) {
			if (!(valueList == null ? meta.valueList == null : valueList.equals(meta.valueList)))
				return false;
		} else {
			if (!(value == null ? meta.value == null : value.equals(meta.value)))
				return false;
		}

		return true;
	}

	@Override
	public int hashCode() {
		if (ValueMode.VALUE_LIST.equals(getValueMode())) {
			return valueList != null ? valueList.hashCode() : 0;
		} else {
			return value != null ? value.hashCode() : 0;
		}
	}

	public Meta() {
		setDefaultValueMode();
		setValue(null);
		setDefaultValueType();
		setLocked(false);
		setLockedChanged(false);
	}

	public Meta(ValueType valueType) {
		this();
		setValueType(valueType);
		setLocked(false);
		setLockedChanged(false);
	}

	public Meta(ValueMode valueMode) {
		this();
		setValueMode(valueMode);
		if (valueMode == ValueMode.VALUE_LIST)
			setValueList(null);
		else {
			setValue(null);
		}
	}

	public Meta(String value) {
		this();
		setValue(value);
		setLocked(false);
		setLockedChanged(false);
	}

	public Meta(String value, ValueType valueType) {
		this();
		setValue(value);
		setValueType(valueType);
		setLocked(false);
		setLockedChanged(false);
	}

	/**
	 * Sets the value of the meta to the given value.
	 * <p>
	 * All errors and warnings will be removed and values that are equivalent to
	 * null are normalized (see {@link #convertEmpty(String)}).
	 * <p>
	 * valueChanged flag is set if the new value differs from the old value
	 * 
	 * @param newValue
	 *            the new value of the Meta
	 */
	public void setValue(String newValue) {
		assertValueMode("setValue(...)", ValueMode.SINGLE_VALUE);
		resetErrorsAndWarnings();
		String newValueConverted = convertEmpty(newValue);
		updateValue(newValueConverted);
	}

	public List<Message> getStatuses() {
		return statuses;
	}

	private void assertValueMode(String methodName, ValueMode valueMode) {
		if (this.valueMode != valueMode) {
			throw new RuntimeException(methodName + " should only be called in " + valueMode);
		}
	}

	public void setValueList(List<String> newValueList) {
		assertValueMode("setValueList(...)", ValueMode.VALUE_LIST);
		resetErrorsAndWarnings();
		List<String> newValueConvertedList = convertEmptyList(newValueList);
		updateValueList(newValueConvertedList);
	}

	/**
	 * This method sets the value and the valueChanged flag. The reason for the
	 * value changed flag is at the end that in cos packets values should only
	 * be set if they have been changed. in case of an init value: null should
	 * not be added. Therefore we set the valueChanged flag when the default
	 * value null is changed to some other value.
	 */
	void updateValue(String newValue) {
		String oldValue = this.value;
		if (oldValue == newValue) {
			return;
		} else if (newValue != null) {
			if (newValue.equals(oldValue)) {
				return;
			} else {
				this.value = newValue;
				setValueChanged(true);
			}
		} else if (newValue == null) {
			this.value = newValue;
			setValueChanged(true);
		}
	}

	/**
	 * This method sets the value and the valueChanged flag. The reason for the
	 * value changed flag is at the end that in cos packets values should only
	 * be set if they have been changed. in case of an init value: null should
	 * not be added. Therefore we set the valueChanged flag when the default
	 * value null is changed to some other value.
	 */
	void updateValueList(List<String> newValueList) {
		List<String> oldValueList = this.valueList;
		if (oldValueList == newValueList) {
			return;
		} else if (newValueList != null) {
			if (newValueList.equals(oldValueList)) {
				return;
			} else {
				this.valueList = newValueList;
				setValueChanged(true);
			}
		} else if (newValueList == null) {
			this.valueList = newValueList;
			setValueChanged(true);
		}
	}

	private void setDefaultValueType() {
		setValueType(ValueType.STRING);
	}

	public ValueType getValueType() {
		return valueType;
	}

	public void setValueType(ValueType valueType) {
		this.valueType = valueType;
	}

	private void setDefaultValueMode() {
		this.valueMode = ValueMode.SINGLE_VALUE;
	}

	public ValueMode getValueMode() {
		return valueMode;
	}

	public void setValueMode(ValueMode valueMode) {
		this.valueMode = valueMode;
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

	/**
	 * Semantically, <tt>null</tt>, "" etc. are identical.
	 * <p/>
	 * <p>
	 * This method converts removes these values. All other values remain
	 * untouched.
	 */
	protected List<String> convertEmptyList(List<String> valueList) {
		if (valueList == null)
			return new ArrayList<String>();
		Iterator<String> iterator = valueList.iterator();
		while (iterator.hasNext()) {
			String value = iterator.next();
			if (value == null || value.length() == 0 || value.equals("empty.none")) {
				iterator.remove();
			}
		}
		return valueList;
	}

	public String getValue() {
		assertValueMode("getValue(...)", ValueMode.SINGLE_VALUE);
		return value;
	}

	public List<String> getValueList() {
		assertValueMode("getValueList(...)", ValueMode.VALUE_LIST);
		return valueList;
	}

	public void addWarning(Message message) {
		getWarnings().add(message);
	}

	public List<Message> getWarnings() {
		if (warnings == null) {
			warnings = new ArrayList<Message>();
		}

		return warnings;
	}

	public int getNumberOfWarnings() {
		return getWarnings().size();
	}

	public boolean getHasWarnings() {
		return !getWarnings().isEmpty();
	}

	public void addError(Message message) {
		getErrors().add(message);
	}

	public List<Message> getErrors() {
		if (errors == null) {
			errors = new ArrayList<Message>();
		}

		return errors;
	}

	/**
	 * @deprecated Deprecated because it violates the Java Beans naming
	 *             conventions. Please use {@link #getHasErrors()}
	 */
	public boolean hasErrors() {
		return getHasErrors();
	}

	public boolean getHasErrors() {
		return !getErrors().isEmpty();
	}

	public boolean hasWarningsOrErrors() {
		return getHasWarnings() || getHasErrors();
	}

	public int getNumberOfErrors() {
		return getErrors().size();
	}

	/**
	 * @deprecated Please use the more specific methods like
	 *             resetErrorsAnWarnings() or reset(boolean, boolean, boolean,
	 *             boolean)
	 */
	public void reset() {
		resetErrorsAndWarnings();
	}

	/**
	 * Resets parts of a Meta back to default values
	 * 
	 * @param value
	 *            if true, value is set to null
	 * @param valueChanged
	 *            if true, valueChanged is set to false
	 * @param errors
	 *            if true, all errors are removed
	 * @param warnings
	 *            if true, all warnings are removed
	 */
	public void reset(boolean value, boolean valueChanged, boolean errors, boolean warnings) {
		if (value) {
			if (valueMode == ValueMode.SINGLE_VALUE) {
				setValue(null);
			} else if (valueMode == ValueMode.VALUE_LIST) {
				setValueList(null);
			}
		}
		if (valueChanged) {
			setValueChanged(false);
		}
		if (errors) {
			getErrors().clear();
		}
		if (warnings) {
			getWarnings().clear();
		}
		setLocked(false);
		setLockedChanged(false);
	}

	/**
	 * All errors and warnings are removed.
	 */
	public void resetErrorsAndWarnings() {
		reset(false, false, true, true);
	}

	/**
	 * All errors and warnings are removed and valueChanged is set to false.
	 */
	public void resetErrorsAndWarningsAndValueChanged() {
		reset(false, true, true, true);
	}

	public boolean isValueChanged() {
		return valueChanged;
	}

	public void setValueChanged(boolean valueChanged) {
		this.valueChanged = valueChanged;
	}

	public boolean isLocked() {
		return locked;
	}

	public void setLocked(boolean locked) {
		this.locked = locked;
	}

	public boolean isLockedChanged() {
		return lockedChanged;
	}

	public void setLockedChanged(boolean lockedChanged) {
		this.lockedChanged = lockedChanged;
	}

	/**
	 * Sets the value of the meta to the value of the given meta. <b> All Errors
	 * and Warnings will be removed </b>
	 * 
	 * @param value
	 *            the Meta with the new value for this meta
	 */
	public void copyValue(Meta value) {
		resetErrorsAndWarnings();
		setValue(value.getValue());
	}

	@Override
	public String toString() {
		return "Meta value : " + value;
	}

	public boolean getHasStatuses() {
		return !getStatuses().isEmpty();
	}

}