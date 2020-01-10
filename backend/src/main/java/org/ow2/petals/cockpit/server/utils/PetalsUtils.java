/**
 * Copyright (C) 2017-2020 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.ow2.petals.cockpit.server.utils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;
import org.ow2.petals.jbi.descriptor.JBIDescriptorException;
import org.ow2.petals.jbi.descriptor.original.JBIDescriptorBuilder;
import org.ow2.petals.jbi.descriptor.original.generated.Identification;
import org.ow2.petals.jbi.descriptor.original.generated.Jbi;
import org.ow2.petals.jbi.descriptor.original.generated.ServiceAssembly;
import org.ow2.petals.jbi.descriptor.original.generated.ServiceUnit;
import org.ow2.petals.jbi.descriptor.original.generated.Target;

public class PetalsUtils {

    private PetalsUtils() {
        // utility class
    }

    public static void createSAfromSU(InputStream su, OutputStream out, String saName, String suName,
            String componentName) throws IOException, JBIDescriptorException {

        Jbi descriptor = new Jbi();
        descriptor.setVersion(BigDecimal.valueOf(1));

        ServiceAssembly serviceAssembly = new ServiceAssembly();
        descriptor.setServiceAssembly(serviceAssembly);

        Identification saIdentification = new Identification();
        serviceAssembly.setIdentification(saIdentification);
        saIdentification.setName(saName);
        saIdentification.setDescription("SA automatically generated to deploy SU '" + suName + "'");

        ServiceUnit serviceUnit = new ServiceUnit();
        serviceAssembly.getServiceUnit().add(serviceUnit);

        Identification suIdentification = new Identification();
        suIdentification.setName(suName);
        suIdentification.setDescription("Original deployed SU");
        serviceUnit.setIdentification(suIdentification);

        Target suTarget = new Target();
        suTarget.setArtifactsZip(suName + ".zip");
        suTarget.setComponentName(componentName);
        serviceUnit.setTarget(suTarget);

        try (ZipOutputStream saZos = new ZipOutputStream(out)) {
            ZipEntry jbiEntry = new ZipEntry(JBIDescriptorBuilder.JBI_DESCRIPTOR_RESOURCE);
            saZos.putNextEntry(jbiEntry);
            try {
                JBIDescriptorBuilder.getInstance().writeXMLJBIdescriptor(descriptor, saZos);
            } finally {
                saZos.closeEntry();
            }

            // TODO add some checks to validate all is ok with the SU?
            ZipEntry serviceUnitEntry = new ZipEntry(suTarget.getArtifactsZip());
            saZos.putNextEntry(serviceUnitEntry);
            try {
                IOUtils.copy(su, saZos);
            } finally {
                saZos.closeEntry();
            }
        }
    }

}
