package com.deniz.framework.logging.layout;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.PatternLayout;
import org.apache.log4j.spi.LoggingEvent;


/**
 * <p/>
 * Class description here...
 * </p>
 * @author Deniz Yavas
 */

public class AnonymizedPatternLayout extends PatternLayout
{
	private String uNumberRegEx = "[uU][0-9]{3}([0-9]{3})";
	private String replacement = "uXXX$1";
	Pattern pattern;

	public AnonymizedPatternLayout()
	{
		pattern = Pattern.compile( uNumberRegEx );
	}

	public void setReplacement( String replacement )
	{
		this.replacement = replacement;
	}

	public void setuNumberRegEx( String uNumberRegEx )
	{
		this.uNumberRegEx = uNumberRegEx;
		pattern = Pattern.compile( uNumberRegEx );
	}

	@Override
	public String format( LoggingEvent event )
	{
		String formattedEvent = super.format( event );
		Matcher matcher = pattern.matcher( formattedEvent );
		formattedEvent = matcher.replaceAll( replacement );
		return formattedEvent;
	}
}
