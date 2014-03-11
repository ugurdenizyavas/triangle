package com.deniz.framework.configuration;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * <p/>
 * Logs the configuration of the application during application startup.
 * <p/>
 * The final configuration values are logged on info level. All properties that contain the string "password" are not logged out
 * as we do not want to have readable passwords in the logfile.
 * </p>
 *
 * @author Deniz Yavas
 */
public class ApplicationConfigurationLogger {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private static final String HEADLINE_DEFAULT = "##################################### Application Configuration ##################################################################";
    private static final String FOOTER_DEFAULT = "##################################################################################################################################";
    private static final String SEPARATOR = "#";
    private static final String TABLE_FORMAT_DEFAULT = SEPARATOR + " %1$-60s" + SEPARATOR + " %2$-65s" + SEPARATOR;
    private static final String SEARCH_STRING_PASSWORDS = "assword";

    private static final String HIDDEN_DEFAULT = "- hidden -";
    private String headline = HEADLINE_DEFAULT;
    private String footer = FOOTER_DEFAULT;
    private String tableFormat = TABLE_FORMAT_DEFAULT;
    private String hiddenText = HIDDEN_DEFAULT;
    private String passwordSearchString = SEARCH_STRING_PASSWORDS;

    private LoggingPropertyPlaceholderConfigurer loggingPropertyPlaceholderConfigurer;
    private String configurerName;

    public void init() {
        logConfiguration();
    }

    private void logConfiguration() {
        logger.info(headline);
        logConfigurerName();
        logPropertyFilenames(loggingPropertyPlaceholderConfigurer);
        logger.info(footer);
        logConfiguration(loggingPropertyPlaceholderConfigurer);
        logger.info(footer);
    }

    private void logConfigurerName() {
        if (configurerName != null)
            logger.info(String.format(tableFormat, "Configurer Name", configurerName));
    }

    private void logPropertyFilenames(LoggingPropertyPlaceholderConfigurer placeholderConfigurer) {
        for (String filename : placeholderConfigurer.getPropertyFilenames()) {
            logger.info(String.format(tableFormat, "Loaded Propertyfile", filename));
        }
    }

    /**
     * Logs the whole configuration as a table. The table sorts the propertys alphabetically.
     */
    private void logConfiguration(LoggingPropertyPlaceholderConfigurer placeholderConfigurer) {
        Map<String, String> configurationProperties = placeholderConfigurer.getConfigurationProperties();

        List<String> sortedProperties = new ArrayList<String>();
        sortedProperties.addAll(configurationProperties.keySet());
        Collections.sort(sortedProperties);

        for (String sortedProperty : sortedProperties) {
            logProperty(sortedProperty, configurationProperties.get(sortedProperty));
        }

    }

    /**
     * Logs one property.
     */
    private void logProperty(String placeholder, String finalValue) {
        String finalValueCensored;
        if (containsPassword(placeholder)) {
            finalValueCensored = hiddenText;
        } else {
            finalValueCensored = finalValue;
        }
        finalValueCensored = removeNewLines(finalValueCensored);
        logger.info(String.format(tableFormat, placeholder, finalValueCensored));
    }

    String removeNewLines(String string) {
        if (string == null)
            return null;
        return string.replace("\n", "|newline|");
    }

    private boolean containsPassword(String string) {
        if (string.indexOf(passwordSearchString) == -1) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Used to specify a name for this configurer that will be logged. This is useful if you have more than one configurer
     * in your application and want to have a name in the log statement so you can differentiate your configurers.
     */
    public void setConfigurerName(String configurerName) {
        this.configurerName = configurerName;
    }

    /**
     * Used to specify a custom header line that is logged before the properties are logged
     */
    public void setHeadline(String headline) {
        this.headline = headline;
    }


    /**
     * Used to specify a custom format for the configuration table that is logged.
     */
    public void setTableFormat(String tableFormat) {
        this.tableFormat = tableFormat;
    }

    /**
     * Used to specify a string that is shown as value for password fields.
     */
    public void setHiddenText(String hiddenText) {
        this.hiddenText = hiddenText;
    }

    /**
     * Used to specify the string that is searched for in order to decide if this is a property that contains
     * a password.
     */
    public void setPasswordSearchString(String passwordSearchString) {
        this.passwordSearchString = passwordSearchString;
    }

    /**
     * Used to specify a custom footer
     */
    public void setFooter(String footer) {
        this.footer = footer;
    }

    public void setLoggingPropertyPlaceholderConfigurer(LoggingPropertyPlaceholderConfigurer loggingPropertyPlaceholderConfigurer) {
        this.loggingPropertyPlaceholderConfigurer = loggingPropertyPlaceholderConfigurer;
    }

}
