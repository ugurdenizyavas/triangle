package com.deniz.framework.dto;

import java.io.Serializable;


/**
 * @author Deniz Yavas
 */
public class VariableValue implements Serializable
{
	String value;
	VariableValueType type;

	public VariableValue( String value, VariableValueType type )
	{
		this.value = value;
		this.type = type;
	}

	public String getValue()
	{
		return value;
	}

	public VariableValueType getType()
	{
		return type;
	}

	@Override
	public String toString()
	{
		return type.getName() + ":" + value;
	}
}
