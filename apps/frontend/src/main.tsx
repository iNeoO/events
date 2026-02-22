import { QueryClientProvider } from "@tanstack/react-query";
import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "./libs/queryClient";
import "./index.css";
import { Theme } from "@radix-ui/themes";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./libs/router";

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// biome-ignore lint/style/noNonNullAssertion: We are certain that the root element exists in the HTML
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<Theme>
					<RouterProvider router={router} />
				</Theme>
			</QueryClientProvider>
		</StrictMode>,
	);
}
