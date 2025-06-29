import { ensoService } from "@/lib/services";
import { BundleAction, } from "@ensofinance/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const {
      chainId,
      fromAddress,
      receiver,
      spender,
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      isExistingPosition,
      underlyingAsset,
      actionType,
    } = body;

    console.log(
      "body",
      chainId,
      fromAddress,
      receiver,
      spender,
      tokenIn,
      tokenOut,
      amountIn,
      slippage
    );

    // Validate required parameters
    const missingParams = [];
    if (!chainId) missingParams.push("chainId");
    if (!fromAddress) missingParams.push("fromAddress");
    if (!receiver) missingParams.push("receiver");
    if (!spender) missingParams.push("spender");
    if (!tokenIn && !tokenOut) missingParams.push("tokenIn or tokenOut");
    if (!amountIn) missingParams.push("amountIn");
    if (!slippage) missingParams.push("slippage");

    if (missingParams.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingParams.join(", ")}` 
        },
        { status: 400 }
      );
    }

    let response;

    switch (actionType) {
      case "remove":
        response = await ensoService.bundle({
          chainId: Number(chainId),
          fromAddress: fromAddress as `0x${string}`,
          operations: [
            {
              protocol: "enso",
              action: "route",
              args: {
                tokenIn: tokenIn[0] as `0x${string}`,
                tokenOut: underlyingAsset as `0x${string}`,
                amountIn,
                slippage,
              },
            } as BundleAction,
          ],
        });
        break;

      case "add":
      default:
        console.log(tokenIn, tokenOut, "token");
        // If underlyingAsset is different from tokenIn, use bundle operation
        if (
          underlyingAsset &&
          underlyingAsset.toLowerCase() &&
          tokenIn[0] &&
          tokenIn[0].toLowerCase() !== underlyingAsset.toLowerCase()
        ) {
          response = await ensoService.bundle({
            chainId: Number(chainId),
            fromAddress: fromAddress as `0x${string}`,
            operations: [
              {
                protocol: "enso",
                action: "route",
                args: {
                  tokenIn: tokenIn[0] as `0x${string}`,
                  tokenOut: underlyingAsset as `0x${string}`,
                  amountIn,
                  slippage,
                },
              } as BundleAction,
              {
                protocol: "enso",
                action: "route",
                args: {
                  tokenIn: underlyingAsset as `0x${string}`,
                  tokenOut: tokenOut[0] as `0x${string}`,
                  amountIn: {
                    useOutputOfCallAt: 0,
                  },
                },
              } as BundleAction,
            ],
          });
        } else {
          // Direct route if no underlying asset swap needed
          response = await ensoService.route({
            chainId: Number(chainId),
            fromAddress: fromAddress as `0x${string}`,
            receiver: receiver as `0x${string}`,
            spender: spender as `0x${string}`,
            tokenIn: tokenIn[0] as `0x${string}`,
            tokenOut: tokenOut[0] as `0x${string}`,
            amountIn: amountIn,
            slippage: Number(slippage),
          });

          console.log(response, "routeResponse");
        }
        break;
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: isExistingPosition
        ? "Successfully added liquidity to existing position"
        : "Successfully created new position",
    });
  } catch (error) {
    console.error("Error processing liquidity request:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
