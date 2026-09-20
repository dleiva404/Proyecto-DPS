import { NextResponse } from "next/server";
import { solicitudesMock } from "@/mocks/solicitudes";

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        total: solicitudesMock.length,
        data: solicitudesMock,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);

    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener las solicitudes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const solicitud = await request.json();

    if (
      !solicitud.empleadoId ||
      !solicitud.tipo ||
      !solicitud.fechaHorario ||
      !solicitud.empresa
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos obligatorios de la solicitud.",
        },
        { status: 400 },
      );
    }

    const nuevaSolicitud = {
      id: crypto.randomUUID(),
      ...solicitud,
    };

    return NextResponse.json(
      {
        success: true,
        mensaje: "Solicitud recibida correctamente.",
        data: nuevaSolicitud,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al procesar solicitud:", error);

    return NextResponse.json(
      {
        success: false,
        error: "No se pudo procesar la solicitud.",
      },
      { status: 500 },
    );
  }
}