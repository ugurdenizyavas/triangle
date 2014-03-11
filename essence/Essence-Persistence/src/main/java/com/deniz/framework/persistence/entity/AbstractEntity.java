package com.deniz.framework.persistence.entity;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.springframework.core.style.ToStringCreator;

/**
 * <p>
 * All entities should inherit from this class it contains the data which is
 * mandatory for all entities like id, created, updated,..
 * </p>
 * 
 * @author Deniz Yavas
 */
@MappedSuperclass
public abstract class AbstractEntity implements Serializable {
	public static final String BUSINESS_KEY_PREFIX = "#";
	private Date created = new Date();

	private Long id;

	private String uuid = java.util.UUID.randomUUID().toString();

	private String simpleName;

	/**
	 * FAQ: How does it work that the created timestamp gets only updated when
	 * an entity is saved for the first time?
	 * <ul>
	 * <li>private Date created = new Date(); initializes created upon every
	 * instantiation
	 * <li>when created already has a value in the db it calls setCreated( Date
	 * created ) with the old created value
	 * <li>when entity is not in db setCreated( Date created ) is not called and
	 * when the entity is saved for the first time created is written to db
	 * </ul>
	 */
	@Temporal(TemporalType.TIMESTAMP)
	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	/**
	 * Subclasses are forced to add a sequence generator because we want to have
	 * one sequence per entity.
	 * <p/>
	 * The following example shows a sequence generator definition for an entity
	 * named "report":
	 * 
	 * <pre>
	 *  {@code
	 *     @Entity(name = "REPORT")
	 *     @SequenceGenerator
	 *       (
	 * name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR",
	 * sequenceName = "REPORT_SEQUENCE"
	 *       )
	 *     public class ReportEntity extends AbstractEntity
	 *  }
	 * </pre>
	 */
	@Id
	@GeneratedValue(generator = "ONE_SEQUENCE_PER_ENTITY_GENERATOR")
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUuid() {
		return uuid;
	}

	@SuppressWarnings("unused")
	private void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public String getSimpleName() {
		return simpleName;
	}

	public void setSimpleName(String simpleName) {
		this.simpleName = simpleName;
	}

	@Override
	public boolean equals(Object o) {
		return (o == this || (o instanceof AbstractEntity && getUuid().equals(((AbstractEntity) o).getUuid())));
	}

	@Override
	public int hashCode() {
		// For some reason when Hibernate loads entities the uuid is null
		final String uuid = getUuid();
		return uuid != null ? uuid.hashCode() : super.hashCode();
	}

	@Override
	public String toString() {
		return new ToStringCreator(this).append("id", getId()).append("simpleName", getSimpleName()).append("uuid", getUuid()).append("created", getCreated())
				.toString();
	}

	@Transient
	public String getInfo() {
		return this.simpleName;
	}

	@Transient
	public boolean isPersistent() {
		return id != null;
	}
}