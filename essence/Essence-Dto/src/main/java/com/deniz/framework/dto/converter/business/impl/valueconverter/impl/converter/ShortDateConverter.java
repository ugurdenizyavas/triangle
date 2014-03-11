package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;


public class ShortDateConverter extends ConverterTemplate
{

	private static final String DATEFORMAT_WITH_SECONDS = "d.M.yyyy HH:mm:ss";

	@Override
	public Class<?> getSupportedClass()
	{
		return java.util.Date.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT_WITH_SECONDS );
		fmt = fmt.withZone( DateTimeZone.UTC );

		Date date = (Date) value;
		DateTime dt = new DateTime( date, DateTimeZone.UTC );
		return dt.toString( fmt );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT_WITH_SECONDS );
		fmt = fmt.withZone( DateTimeZone.UTC );
		Date date = null;

		if ( StringUtils.isNotEmpty( value ) )
		{
			DateTime dt = fmt.parseDateTime( value );
			date = dt.toDate();
		}

		return date;
	}

	/**
	 * Converts String value to Date
	 * 
	 * @param dateValue
	 * @return Date object or null
	 */
	public static Date convertToDate( String dateValue )
	{
		ShortDateConverter converter = new ShortDateConverter();
		return (Date) converter.doConvertToX( dateValue );
	}

	/**
	 * Converts Date object to String
	 * 
	 * @param date
	 * @return String date representation or empty string
	 */
	public static String convertToString( Date date )
	{
		if ( date == null )
		{
			return "";
		}
		ShortDateConverter converter = new ShortDateConverter();
		return converter.doConvertToString( date );
	}
}