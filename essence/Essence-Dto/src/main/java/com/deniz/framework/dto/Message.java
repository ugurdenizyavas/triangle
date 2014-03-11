package com.deniz.framework.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


/**
 * A message does not contain the actual message. It contains the localizer key together with a list
 * of variable values.
 * 
 * <p>
 * The multi language layer (implemented in a separate system, not part of an application) will then take the localizer key
 * together with the variable values and constructs a localized message that will be presented to the user.
 * 
 * <p>
 * e.g. if you have an error message "Maximum of 30 characters allowed in this field" then you would
 * {@link #setLocalizerKey(String)} "error.tomanycharacters" and {@link #addVariableValue(String)} "30". Within the multi language
 * layer, you would then add the string "Maximum of {0} characters allowed in this field".
 * <p>
 * @author Deniz Yavas
 */
public class Message implements Serializable
{
	private String localizerKey;
	private List<VariableValue> variableValues;
	private StatusTypeEnum statusType;

	public Message()
	{
		variableValues = new ArrayList<VariableValue>();
		statusType = StatusTypeEnum.STATUS;
	}

	public Message( String localizerKey )
	{
		variableValues = new ArrayList<VariableValue>();
		setLocalizerKey( localizerKey );
	}

	public String getLocalizerKey()
	{
		return localizerKey;
	}

	/**
	 * The key that is used by multi-language layer to identify a message
	 * @param localizerKey the key that identifies the message
	 */
	public void setLocalizerKey( String localizerKey )
	{
		this.localizerKey = localizerKey;
	}

	public List<VariableValue> getVariableValues()
	{
		return variableValues;
	}

	/**
	 * Add a variable value
	 * 
	 * <p>
	 * Note: Please keep in mind, that the ordering of the variable values is crucial. This order must correspond to the
	 * placeholder order that is contained in the messages that you add to multi language layer.
	 * @param variableValue the value to add
	 */
	public void addVariableValue( VariableValue variableValue )
	{
		variableValues.add( variableValue );
	}

	public StatusTypeEnum getStatusType()
	{
		return statusType;
	}

	public void setStatusType( StatusTypeEnum statusType )
	{
		this.statusType = statusType;
	}

	@Override
	public String toString()
	{
		return "Message [localizerKey=" + localizerKey + ", variableValues=" + variableValues + ", statusType=" + statusType + "]";
	}

}
