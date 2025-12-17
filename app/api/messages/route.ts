import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { NextResponse } from "next/server";

const ELECTRIC_URL = process.env.ELECTRIC_URL || "http://localhost:4000";

/**
 * Proxy API route for Electric SQL shape endpoint.
 */
export async function GET(request: Request) {
  try {
    // Verify session - not needed for now
    // const session = await auth.api.getSession({
    //   headers: await headers(),
    // });
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const userId = parseInt(session.user.id, 10);

    // Construct the Electric URL
    const url = new URL(request.url);
    const originUrl = new URL("/v1/shape", ELECTRIC_URL);
    
    // Passthrough parameters from electric client
    url.searchParams.forEach((value, key) => {
      if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
        originUrl.searchParams.set(key, value)
      }
    })

    // Set the table - sync all messages (filter by thread client-side)
    originUrl.searchParams.set("table", "chat_messages");

    // Proxy the request to Electric
    const response = await fetch(originUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Electric SQL error:",
        response.status,
        response.statusText
      );
      return new NextResponse(response.statusText, {
        status: response.status,
      });
    }

    // Fetch decompresses the body but doesn't remove the
    // content-encoding & content-length headers which would
    // break decoding in the browser.
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // Add Vary header for cookie-based auth
    responseHeaders.set("Vary", "Cookie");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in conversations API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
