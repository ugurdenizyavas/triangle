package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import java.sql.Timestamp;
import java.util.Date;


/**
 * DateConverter defines the conversion {@link String} - {@link Timestamp}.
 * </p>
 * The implementation simply extends the DateConverter and delegates all method calls to DateConverter.
 * This approach was necessary as the ConverterTemplate.getSupportedClass() does not allow that a converter can
 * support more than one class.
 * <p/>
 * 
 * @author Deniz Yavas
 */
public class TimeStampConverter extends DateConverter
{

	@Override
	public Class getSupportedClass()
	{
		return Timestamp.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		return super.doConvertToString( value );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		final Date date = (Date) super.doConvertToX( value );
		Timestamp timestamp = new Timestamp( date.getTime() );
		return timestamp;
	}

	public static Date convertToDate( String value )
	{
		TimeStampConverter converter = new TimeStampConverter();
		return (Date) converter.doConvertToX( value );
	}

}