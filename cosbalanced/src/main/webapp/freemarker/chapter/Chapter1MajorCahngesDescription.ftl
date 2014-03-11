<#-- @ftlvariable name="dto" type="aero.idgroup.workflowfactory.passengerreport.pdfExport_showcase.business.impl.pdf.domain.chapterMajorChanges.PdfReportDto"  -->
<fo:block break-before="page"></fo:block>

<fo:block text-align="left" font-weight="bold" font-size="16pt">
		1  Description
</fo:block>

<fo:block><fo:leader/></fo:block>

<fo:block>
	<fo:table table-layout="fixed" width="100%">
		<fo:table-column column-width="100%"/>

		 <fo:table-header>
			<fo:table-cell padding="2mm" text-align="left" background-color="#848484" border-style="solid" border-width="medium">
				<fo:block font-weight="bold" font-size="11pt" color="white">Example 1</fo:block>
			</fo:table-cell>
		</fo:table-header>

		<fo:table-body>
			<fo:table-row>
				<fo:table-cell padding="2mm" text-align="left" border-style="solid" border-width="medium">
					<#if dto.descriptionMeta.value??>
						<fo:block font-size="10pt">${dto.descriptionMeta.value}</fo:block>
					<#else>
						<fo:block font-size="10pt"> - </fo:block>
					</#if>
				</fo:table-cell>
			</fo:table-row>
		</fo:table-body>
	</fo:table>
</fo:block>

<fo:block><fo:leader/></fo:block>
<fo:block><fo:leader/></fo:block>

<fo:block>
	<fo:table table-layout="fixed" width="100%">
		<fo:table-column column-width="170mm" column-number="1"/>
		<fo:table-body>
			<fo:table-row>
				<fo:table-cell text-align="left">
					<fo:block text-align="left" font-size="4mm">
						Example 2:
					</fo:block>
					<fo:block text-align="left" font-size="4mm" linefeed-treatment="preserve">
                        ${dto.descriptionMeta.value}
					</fo:block>
				</fo:table-cell>
			</fo:table-row>
		</fo:table-body>
	</fo:table>
</fo:block>