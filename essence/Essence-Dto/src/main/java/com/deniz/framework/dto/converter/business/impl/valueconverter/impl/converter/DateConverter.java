package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;


/**
 * DateConverter defines the conversion {@link String} - {@link Date}.
 */
public class DateConverter extends ConverterTemplate
{
	private static final String DATEFORMAT = "yyyy-MM-dd HH:mm";

	@Override
	public Class getSupportedClass()
	{
		return Date.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT );
		fmt = fmt.withZone( DateTimeZone.UTC );

		Date date = (Date) value;
		DateTime dt = new DateTime( date, DateTimeZone.UTC );
		return dt.toString( fmt );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT );
		fmt = fmt.withZone( DateTimeZone.UTC );
		Date date = null;

		if ( StringUtils.isNotEmpty( value ) )
		{
			DateTime dt = fmt.parseDateTime( value );
			date = dt.toDate();
		}

		return date;
	}
}
