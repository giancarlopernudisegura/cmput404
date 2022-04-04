import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Box, Tab, Tabs } from '@mui/material';
import TabPanel from './TabPanel';


/**
 * Reference: https://mui.com/components/tabs/#main-content
 */

type TabPanelProps = {
    sectionContent: Object
}

export default function SectionTabs({ sectionContent }: TabPanelProps) {
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }
    const [tabLabels, setTabLabels] = useState(Array());

    useEffect(() => {
        const unpackSectionContents = () => {
            let labels = Object.keys(sectionContent);
            setTabLabels(labels);
        }
        unpackSectionContents();

    }, [sectionContent])


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} >
                    <Tab label="Item One" />
                    <Tab label="Item Two" />
                    <Tab label="Item Three" />

                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                Item One
            </TabPanel>
            <TabPanel value={value} index={1}>
                Item Two
            </TabPanel>
            <TabPanel value={value} index={2}>
                Item Three
            </TabPanel>
        </Box>
    );
}
