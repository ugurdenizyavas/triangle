
<#import "../globals/globals.ftl" as global>

<fo:block-container position="absolute"
                    top="1mm"
                    font-size="${fontsize_head}"
                    font-weight="bold"
                    vertical-align="bottom"
                    text-align="left"  >
    <fo:block>
        <fo:table table-layout="fixed" width="100%" border-bottom-style="solid" border-bottom-width="0.3mm" border-bottom-color="black">
            <fo:table-column column-width="135mm" column-number="1"/>
            <fo:table-column column-width="35mm" column-number="2"/>
            <fo:table-body>
                <fo:table-row>
                    <fo:table-cell>
                        <fo:block padding-top="2.5mm">
                            <![CDATA[${reportTitle}]]>
                        </fo:block>
                    </fo:table-cell>

                    <fo:table-cell display-align="center">
                        <fo:block>
                             <fo:external-graphic src="servlet-context:freemarker/images/lufthansa297_63.png" content-height="245px" content-width="94px" padding-left="1mm"/>
                        </fo:block>
                    </fo:table-cell>
                </fo:table-row>
            </fo:table-body>
        </fo:table>
    </fo:block>

   <fo:block padding-top="3mm">
	    <fo:table table-layout="fixed" width="100%">
            <fo:table-column column-width="170mm" column-number="1"/>

		     <fo:table-body>
                <fo:table-row>
                    <fo:table-cell>
	                    <fo:block padding-top="2.5mm">
                             <![CDATA[${dto.titleMeta.value}]]>
                        </fo:block>
                    </fo:table-cell>
                 </fo:table-row>
            </fo:table-body>
        </fo:table>
    </fo:block>

</fo:block-container>