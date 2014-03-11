package com.deniz.framework.controller;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This servlet allows to override RestEasy service request by getting the json
 * data directly from server file. If there is corresponding json file in /json
 * directory it will be used. If not then then the corresponding RestEasy
 * service is called.
 * <p/>
 * 
 * @author deniz.yavas
 * 
 */
public class ResourceDelegatorServlet extends HttpServlet {
	private static final Logger log = LoggerFactory
			.getLogger(ResourceDelegatorServlet.class);
	private String resourceExtension;
	private String resourcePath;
	private String forwardRequestPath;
	private boolean useSimpleResourcePath;

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);

		resourceExtension = getServletConfig().getInitParameter(
				"resourceExtension");
		resourcePath = getServletConfig().getInitParameter("resourcePath");
		forwardRequestPath = getServletConfig().getInitParameter(
				"forwardRequestPath");

		final String useSimpleResourcePathString = getServletConfig()
				.getInitParameter("useSimpleResourcePath");
		if (useSimpleResourcePathString != null) {
			useSimpleResourcePath = Boolean
					.parseBoolean(useSimpleResourcePathString);
		}

		if (resourceExtension == null) {
			throw new ServletException(
					"The servlet init parameter \"resourceExtension\" is missing!");
		}

		if (resourcePath == null) {
			throw new ServletException(
					"The servlet init parameter \"resourcePath\" is missing!");
		}

		if (forwardRequestPath == null) {
			throw new ServletException(
					"The servlet init parameter \"forwardRequestPath\" is missing!");
		}

	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		forward(request, response);
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		forward(request, response);
	}

	private void forward(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		final String pathInfo = request.getPathInfo();
		if (pathInfo != null) {
			String resource = resourcePath + pathInfo + resourceExtension;

			final ServletContext context = getServletContext();

			final InputStream is = context.getResourceAsStream(resource);
			if (is == null) {
				resource = forwardRequestPath + pathInfo;
			} else {
				// The hack is needed for Tomcat 6.0.20. It is not needed since
				// 6.0.30. In this case disable
				// it by setting the useSimpleResourcePath to true in web.xml
				// Catalina Bug 50026 fixed in 6.0.30: Add support for mapping
				// the default servlet to URLs other than /.
				if (!useSimpleResourcePath) {
					// Crazy hack! We have to duplicate resourcePath, because we
					// are using DefaultServlet
					// to workaround services-test being masked by this servlet
					// mapping. The response from
					// Catalina is inconsistent like shit.
					// More info here
					// https://issues.apache.org/bugzilla/show_bug.cgi?id=50026
					// Other possible solutions here
					// http://stackoverflow.com/questions/870150/how-to-access-static-resources-when-using-default-servlet/3593513#3593513
					resource = resourcePath + resource;
				}

				is.close();
			}

			log.info("Forwarding from: " + pathInfo + " to: " + resource);

			context.getRequestDispatcher(resource).forward(request, response);

		}
	}

}
