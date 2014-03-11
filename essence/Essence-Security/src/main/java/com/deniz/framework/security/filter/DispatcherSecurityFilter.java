package com.deniz.framework.security.filter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.deniz.framework.security.PojoRequestInfo;
import com.deniz.framework.security.TestingRequestInfoProvider;
import com.deniz.framework.security.ThreadLocalRequestInfoProvider;
import com.deniz.framework.security.authorization.AuthorizationService;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class DispatcherSecurityFilter implements Filter {
	// ==== static members ====

	private static final Logger LOGGER = LoggerFactory.getLogger(DispatcherSecurityFilter.class);

	// ==== private attributes ====

	private TestingRequestInfoProvider testingRequestInfoProvider;

	private boolean disableDispatcherCheck;

	// ==== private members ====

	private ThreadLocalRequestInfoProvider threadLocalRequestInfoProvider = new ThreadLocalRequestInfoProvider();
	
	private AuthorizationService authorizationService;

	// ==== constructors ====

	// ==== simple getters and setters ====

	// ==== "complex" getters and setters ====

	// ==== lifecycle methods ====

	// ==== interface Filter implementation ====

	@SuppressWarnings("unchecked")
	public void init(FilterConfig filterConfig) throws ServletException {

		disableDispatcherCheck = Boolean.parseBoolean(filterConfig.getInitParameter("disableDispatcherCheck"));

		String initParameter = filterConfig.getInitParameter("useradminhost");
		String initParameter2 = filterConfig.getInitParameter("useradminport");

		System.out.println(initParameter + initParameter2);

		final Map<String, TestingRequestInfoProvider> requestInfoBeans = (Map<String, TestingRequestInfoProvider>) getBeanFromContext(filterConfig, TestingRequestInfoProvider.class);
		if (requestInfoBeans.size() == 1) {
			testingRequestInfoProvider = requestInfoBeans.values().iterator().next();
		} else if (requestInfoBeans.size() > 1) {
			System.err.println("DispatcherGateFilter: Found more than one bean of type TestingRequestInfoProvider.");
			throw new RuntimeException("DispatcherGateFilter: Found more than one bean of type TestingRequestInfoProvider.");
		} else {
			LOGGER.warn("Can not find bean of type TestingRequestInfoProvider in spring context.");
		}

		final Map<String, AuthorizationService> authorizationBeans = (Map<String, AuthorizationService>)getBeanFromContext(filterConfig, AuthorizationService.class);
		if (authorizationBeans.size() == 1) {
			authorizationService = authorizationBeans.values().iterator().next();
		} else if (authorizationBeans.size() > 1) {
			System.err.println("DispatcherGateFilter: Found more than one bean of type AuthenticationService.");
			throw new RuntimeException("DispatcherGateFilter: Found more than one bean of type AuthenticationService.");
		} else {
			LOGGER.warn("Can not find bean of type AuthenticationService in spring context.");
		}
	}

	private Map<String, ?> getBeanFromContext(FilterConfig filterConfig, Class<?> clazz) {
		return WebApplicationContextUtils.getWebApplicationContext(filterConfig.getServletContext())
				.getBeansOfType(clazz);
	}

	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
		final HttpServletRequest request = (HttpServletRequest) servletRequest;
		final HttpServletResponse response = (HttpServletResponse) servletResponse;

		// 1. check dispatcher header

		final boolean viaDispatcher = "true".equals(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_FILTERED));
		// if (viaDispatcher || isTestMode()) {
		PojoRequestInfo requestInfo = null;
		boolean inTest = isTestMode();
		if (inTest) {
			requestInfo = (PojoRequestInfo) testingRequestInfoProvider.getCurrentRequestInfo(request);
		} else {
			// 2. set username and mandant in session ..

			requestInfo = new PojoRequestInfo();

			requestInfo.setViaDispatcher(viaDispatcher);

			//
			requestInfo.setInstanceId(request.getHeader(DispatcherClientConstants.ID_HEADER_INSTANCE));
			// user session info
			requestInfo.setSessionId(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_SESSION_ID));
			requestInfo.setUsername(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_USERNAME));
			requestInfo.setMandator(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_MANDATOR));
			requestInfo.setLanguage(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_LANGUAGE));
			// service info
			requestInfo.setServiceId(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_SERVICE_ID));
			requestInfo.setRequestId(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_ID));
			requestInfo.setDomain(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_DOMAIN));
			requestInfo.setPermission(request.getHeader(DispatcherClientConstants.DISPATCHER_HEADER_REQUEST_PERMISSION));

			// ---

			request.setAttribute(DispatcherClientConstants.ATTRIBUTE_KEY_REQUEST_INFO, requestInfo);

			// ----
		}

		threadLocalRequestInfoProvider.setRequestInfo(requestInfo);

		boolean hasRight =
		// inTest ||
		checkRight(request.getPathInfo(), requestInfo);
		if (hasRight) {
			try {
				filterChain.doFilter(servletRequest, servletResponse);
			} finally {
				threadLocalRequestInfoProvider.removeRequestInfo();
			}

		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Dispatcher Gate: Access forbidden!");
		}
	}

	private boolean checkRight(String pathInfo, PojoRequestInfo requestInfo) throws IOException {
		String response = authorizationService.authenticate(requestInfo);
		try {
			JSONObject jsonResponse = new JSONObject(response);
			JSONArray rolesJson = (JSONArray) jsonResponse.get("roles");
			Gson gson = new Gson();
			TypeToken<List<String>> token = new TypeToken<List<String>>() {
			};
			List<String> roles = gson.fromJson(rolesJson.toString(), token.getType());
			String targetPath = StringUtils.substring(pathInfo, 1);
			for (String role : roles) {
				if (StringUtils.equals(role, targetPath)) {
					return true;
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return false;
	}

	public void destroy() {
	}

	// ==== business logic ====

	// ==== private methods ====

	private boolean isTestMode() {
		return disableDispatcherCheck || (testingRequestInfoProvider != null && Boolean.parseBoolean(testingRequestInfoProvider.isTestMode()));
	}

	// ==== methods from java.lang.Object ====

}
