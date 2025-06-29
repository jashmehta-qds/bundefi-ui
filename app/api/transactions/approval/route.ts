import { ensoService } from "@/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const {
      chainId,
      fromAddress,
      tokenAddress,
      amount,
      checkOnly // New parameter to indicate we're just checking allowance
    } = body;

    // Validate required parameters
    const missingParams = [];
    if (!chainId) missingParams.push("chainId");
    if (!fromAddress) missingParams.push("fromAddress");
    if (!tokenAddress) missingParams.push("tokenAddress");
    if (!amount) missingParams.push("amount");

    if (missingParams.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingParams.join(", ")}` 
        },
        { status: 400 }
      );
    }

    const approvalData = await ensoService.getApprovalData({
      chainId: Number(chainId),
      fromAddress: fromAddress as `0x${string}`,
      tokenAddress: tokenAddress as `0x${string}`,
      amount: amount
    });

    return NextResponse.json({
      success: true,
      data: approvalData,
      message: checkOnly 
        ? "Successfully retrieved approval data for checking"
        : "Successfully generated approval data"
    });
  } catch (error) {
    console.error("Error processing approval request:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
} 