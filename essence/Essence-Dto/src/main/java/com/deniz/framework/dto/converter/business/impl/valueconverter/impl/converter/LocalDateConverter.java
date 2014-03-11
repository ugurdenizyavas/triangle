package com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter;

import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;


/**
 * DateConverter defines the conversion {@link String} - Joda Time's {@link LocalDate}.
 * <p/>
 * 
 * @author Deniz Yavas
 */
public class LocalDateConverter extends ConverterTemplate
{
	private static final String DATEFORMAT = "yyyy-MM-dd";

	@Override
	public Class getSupportedClass()
	{
		return LocalDate.class;
	}

	@Override
	protected String doConvertToString( Object value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT );
		fmt = fmt.withZone( DateTimeZone.UTC );
		LocalDate date = (LocalDate) value;
		return fmt.print( date );
	}

	@Override
	protected Object doConvertToX( String value )
	{
		DateTimeFormatter fmt = DateTimeFormat.forPattern( DATEFORMAT );
		fmt = fmt.withZone( DateTimeZone.UTC );
		LocalDate date = null;

		if ( StringUtils.isNotEmpty( value ) )
		{
			DateTime dt = fmt.parseDateTime( value );
			date = dt.toLocalDate();
		}

		return date;
	}

	public static Date convertToDate( String date )
	{
		LocalDateConverter localDateConverter = new LocalDateConverter();
		LocalDate dateTime = (LocalDate) localDateConverter.doConvertToX( date );
		return dateTime.toDate();
	}
}
