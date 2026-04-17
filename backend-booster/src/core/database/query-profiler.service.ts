import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface ExplainResult {
  query: string;
  plan: unknown[];
  executionTimeMs?: number;
}

@Injectable()
export class QueryProfilerService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Executa EXPLAIN ANALYZE em uma query SQL bruta.
   * Usar apenas em ambiente de desenvolvimento/staging.
   */
  async explain(sql: string, params: unknown[] = []): Promise<ExplainResult> {
    const plan = await this.dataSource.query(
      `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`,
      params,
    );

    const executionTimeMs =
      plan[0]?.['QUERY PLAN']?.[0]?.['Execution Time'] ?? null;

    return { query: sql, plan: plan[0]?.['QUERY PLAN'] ?? plan, executionTimeMs };
  }

  /**
   * Perfis das queries mais pesadas do sistema para diagnóstico.
   */
  async profileCriticalQueries(): Promise<Record<string, ExplainResult>> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const results: Record<string, ExplainResult> = {};

    // Dashboard: vendas do mês
    results['dashboard_sales_this_month'] = await this.explain(
      `SELECT SUM(valor_total) AS total FROM pedido WHERE created_at >= $1 AND status != 'CANCELADO'`,
      [thisMonth],
    );

    // Dashboard: pedidos recentes
    results['dashboard_recent_orders'] = await this.explain(
      `SELECT p.*, u.nome FROM pedido p LEFT JOIN usuario u ON u.id_usuario = p.id_cliente ORDER BY p.created_at DESC LIMIT 10`,
    );

    // Pedidos do usuário (simula busca por id_cliente)
    results['pedido_find_my_orders'] = await this.explain(
      `SELECT * FROM pedido WHERE id_cliente = $1 ORDER BY created_at DESC`,
      [1],
    );

    // Catálogo de produtos com joins
    results['produto_find_all'] = await this.explain(
      `SELECT p.*, c.nome AS categoria, f.nome AS fabricante FROM produto p LEFT JOIN categoria c ON c.id_categoria = p.id_categoria LEFT JOIN fabricante f ON f.id_fabricante = p.id_fabricante`,
    );

    // Chat: salas aguardando
    results['chat_waiting_rooms'] = await this.explain(
      `SELECT * FROM rooms WHERE status IN ('waiting', 'active') ORDER BY created_at DESC`,
    );

    // Agendamentos por usuário
    results['agendamento_by_usuario'] = await this.explain(
      `SELECT * FROM agendamento WHERE id_usuario = $1 ORDER BY data_agendamento DESC`,
      [1],
    );

    return results;
  }
}
