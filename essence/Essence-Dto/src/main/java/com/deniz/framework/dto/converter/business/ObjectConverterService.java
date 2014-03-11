package com.deniz.framework.dto.converter.business;

import com.deniz.framework.dto.Meta;

/**
 * This service converts objects that contain {@link Meta} objects.
 * <p/>
 * <p>
 * Implementations of this interface have to guarantee that objects that contain collections are recursively converted. Finding
 * the corresponding Meta property pairs (e.g. Date birthdate -> Meta birthdateMeta) is done using the <i>convention over
 * configuration</i> paradigm. The caller has to make sure that the objects that are handed to the ObjectConverterService adhere
 * to this convention.
 * <p/>
 * <p>
 * The actual value conversion from Meta.value fields to the corresponding property is done using a
 * {@link com.celebi.framework.dto.converter.business.impl.valueconverter.ValueConverter} that has to be injected.
 * <p/>
 * <p>
 * Special cases and how they are handled:
 * <ul>
 * <li>Property->Meta where no Meta is present e.g. id -> no 'idMeta': In this case no conversion is done and there is also no
 * exception thrown as this is a regular case. If there is no corresponding Meta field, then the programmer states that no
 * conversion to a Meta object should take place.
 * </ul>
 * <p/>
 * @author Deniz Yavas
 */
public interface ObjectConverterService
{

	/**
	 * All properties of the given source object are copied to the corresponding
	 * Meta fields of the target object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonForm.firstname -> PersonEntity.firstnameMeta
	 * </pre>
	 * <p/>
	 * If no corresponding Meta exists, nothing is copied for this property.
	 * <p>
	 * The blackList will be checked on the first level recursion. If a propertyName is contained in the blackList, it will not be
	 * copied
	 * <p/>
	 * @param source The object where property values are copied from
	 * @param target The object that contains Meta fields to which the value is copied to
	 * @param blackList A list of propertyNames that should not be converted. Null value is allowed.
	 */
	void copyPropertiesToMetas( Object source, Object target, String... blackList );

	/**
	 * All properties of the given source object are copied to the corresponding
	 * Meta fields of the target object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonForm.firstName -> PersonEntity.firstNameMeta
	 * </pre>
	 * <p/>
	 * If no corresponding Meta exists, nothing is copied for this property.
	 * <p/>
	 * @param source The object where property values are copied from
	 * @param target The object that contains Meta fields to which the value is copied to
	 */
	void copyPropertiesToMetas( Object source, Object target );


	/**
	 * All properties of the given object are copied to the corresponding
	 * Meta fields of the same object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonEntity.firstName -> PersonEntity.firstNameMeta
	 * </pre>
	 * <p/>
	 * If no corresponding Meta exists, nothing is copied for this property.
	 * <p>
	 * The blackList will be checked on the first level recursion. If a propertyName is contained in the blackList, it will not be
	 * copied
	 * <p/>
	 * @param sourceAndTarget The object that contains both, the properties and the Meta fields from/to which values are copied.
	 * @param blackList A list of propertyNames that should not be converted. Null value is allowed.
	 */
	void copyPropertiesToMetas( Object sourceAndTarget, String... blackList );

	/**
	 * All properties of the given object are copied to the corresponding
	 * Meta fields of the same object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonEntity.firstName -> PersonEntity.firstNameMeta
	 * </pre>
	 * <p/>
	 * If no corresponding Meta exists, nothing is copied for this property.
	 * <p>
	 * The blackList will be checked on the first level recursion. If a propertyName is contained in the blackList, it will not be
	 * copied
	 * <p/>
	 * @param sourceAndTarget The object that contains both, the properties and the Meta fields from/to which values are copied.
	 */
	void copyPropertiesToMetas( Object sourceAndTarget );


	/**
	 * All Metas of the given object are copied to the corresponding properties of the same object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonEntity.firstNameMeta -> PersonEntity.firstName
	 * </pre>
	 * <p/>
	 * @param sourceAndTarget The object that contains both, the Meta fields and the properties from/to which values are copied.
	 */
	void copyMetasToProperties( Object sourceAndTarget );

	/**
	 * All Metas of the source object are copied to the properties of the target object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonDto.firstNameMeta -> PersonEntity.firstName
	 * </pre>
	 * <p/>
	 * @param source The object where Meta values are copied from
	 * @param target The object that contains properties to which the value is copied to
	 */
	void copyMetasToProperties( Object source, Object target );

	/**
	 * All Metas of the source object are copied to the properties of the target object:
	 * <p/>
	 * 
	 * <pre class="code">
	 * PersonDto.firstNameMeta -> PersonEntity.firstName
	 * </pre>
	 * <p>
	 * The blackList will be checked on the first level recursion. If a propertyName is contained in the blackList, it will not be
	 * copied
	 * <p/>
	 * @param source The object where Meta values are copied from
	 * @param target The object that contains properties to which the value is copied to
	 * @param blackList A list of propertyNames that should not be converted. Null value is allowed.
	 */
	void copyMetasToProperties( Object source, Object target, String... blackList );

}
