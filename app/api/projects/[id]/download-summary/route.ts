import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { createElement } from 'react';
import ProjectSummaryPDF from '@/components/pdf/ProjectSummaryPDF';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get auth
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch project from Supabase
        const { data: projectData, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !projectData) {
            return new Response('Project not found', { status: 404 });
        }

        // Get playbook data from request (passed as query param)
        const url = new URL(request.url);
        const playbookDataParam = url.searchParams.get('playbook');

        let playbookData = {};
        if (playbookDataParam) {
            try {
                playbookData = JSON.parse(decodeURIComponent(playbookDataParam));
            } catch (e) {
                console.error('Failed to parse playbook data:', e);
            }
        }

        // Generate PDF using createElement instead of JSX
        const pdfDoc = createElement(ProjectSummaryPDF, {
            project: projectData,
            playbookFree: playbookData
        });

        const stream = await renderToStream(pdfDoc);

        // Return as downloadable file
        const fileName = `${projectData.title?.replace(/[^a-z0-9]/gi, '_') || 'Project'}_Summary_${new Date().toISOString().split('T')[0]}.pdf`;

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return new Response(`Error generating PDF: ${error.message}`, { status: 500 });
    }
}
