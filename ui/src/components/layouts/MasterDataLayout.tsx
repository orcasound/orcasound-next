import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import * as React from "react";

import { DataProvider } from "@/context/DataContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { NowPlayingProvider } from "@/context/NowPlayingContext";
import darkTheme from "@/styles/darkTheme";

export function MasterDataLayout({ children }: { children: React.ReactNode }) {
  // const { useLiveData, setUseLiveData } = useData();
  // const dataset = useMasterData(useLiveData);

  // use toggle switch in dev mode between live API data vs seed data
  // const [useLiveData, setUseLiveData] = useState(true);

  //// RENDER

  return (
    <Box
      sx={{
        // use `dvh` for dynamic viewport height to handle mobile browser weirdness
        // but fallback to `vh` for browsers that don't support `dvh`
        // `&` is a workaround because sx prop can't have identical keys
        "&": {
          height: "100dvh",
        },
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <button
          // onClick={() => setUseLiveData((prev) => !prev)}
          style={{
            position: "fixed",
            zIndex: 10000,
            bottom: "4%",
            right: "5%",
            background: "yellow",
          }}
        >
          {/* {useLiveData ? "Using LIVE data" : "Using SEED data"} */}
        </button>
      )}
      <NowPlayingProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <DataProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </DataProvider>
        </ThemeProvider>
      </NowPlayingProvider>
    </Box>
  );
}

// Not using this currently, removing to satisfy ES Lint
// export function getMasterDataLayout(page: ReactElement) {
//   return <MasterDataLayout>{page}</MasterDataLayout>;
// }
