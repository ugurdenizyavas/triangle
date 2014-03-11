package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import java.sql.Timestamp;
import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;


/**
 * DateWithTimeCutoffConverter defines the conversion {@link String} - {@link java.util.Date} while cutting off the time, timezone
 * etc. information:
 * Example: "2012-12-03" (String) -> "2012-12-03 14:45:02" (java.util.Date) -> "2012-12-03" (String)
 * <p>
 * @author deniz.yavas
 * 
 */
public class DateWithTimeCutoffConverter extends ConverterTemplate
{
	private static final String DATEFORMAT = "yyyy-MM-dd";

	@Override
	public Class getSupportedClass()
	{
		return Timestamp.class;
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
