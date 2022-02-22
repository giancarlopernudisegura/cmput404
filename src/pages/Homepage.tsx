import { h, Component, ComponentChild } from 'preact'
import { AppBar, Card, CardContent, Menu, MenuItem } from '@mui/material';
import { useEffect } from 'preact/hooks';
import { Button } from '@mui/material';


type FeedProps = {
  path: string
};


function Homepage(props : FeedProps) {
    useEffect(() => {
        // TODO get posts
        const val = [
            { title: "Lidia"}
        ];
    }, []);

    const createCards = (val: any) => {
        return (
            <div>
                {val.map((v : any, idx: any) => {
                    return (
                        <Card>
                            <CardContent>
                                <p>Hello {idx}</p>
                            </CardContent>
                        </Card>
                    );

                })}
            </div>
        );
    }

  return (
    <div>
      <AppBar>
        <Menu open={true}>
          <MenuItem>Profile</MenuItem>
        </Menu>
      </AppBar>
      {createCards([{ title: "Lidia"}])}
      {/* <Button onClick={}></Button> */}
    </div>
  );
}

export default Homepage;