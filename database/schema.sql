-- Схема базы данных для AI-юридической платформы
-- PostgreSQL 15+

-- Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_type_enum AS ENUM ('individual', 'legal');
CREATE TYPE subscription_plan_enum AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE document_type_enum AS ENUM ('claim', 'complaint', 'demand', 'wb_claim', 'zozp_claim', 'auto_fine');
CREATE TYPE document_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE risk_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_type_enum AS ENUM ('financial', 'legal', 'operational', 'reputational');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(500) NOT NULL,
    user_type user_type_enum NOT NULL DEFAULT 'individual',
    phone VARCHAR(20),
    company_name VARCHAR(500),
    company_inn VARCHAR(12),
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type subscription_plan_enum NOT NULL DEFAULT 'free',
    status subscription_status_enum NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    payment_method VARCHAR(50),
    external_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- USAGE LIMITS TABLE
-- ============================================

CREATE TABLE usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_type subscription_plan_enum NOT NULL DEFAULT 'free',
    documents_generated INT NOT NULL DEFAULT 0,
    contracts_reviewed INT NOT NULL DEFAULT 0,
    max_documents INT NOT NULL DEFAULT 5,
    max_contracts INT NOT NULL DEFAULT 3,
    reset_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_usage FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_usage UNIQUE (user_id)
);

-- Индексы для usage_limits
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX idx_usage_limits_reset_date ON usage_limits(reset_date);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    document_type document_type_enum NOT NULL,
    input_data JSONB NOT NULL,
    generated_content TEXT,
    status document_status_enum NOT NULL DEFAULT 'pending',
    error_message TEXT,
    ai_tokens_used INT NOT NULL DEFAULT 0,
    n8n_workflow_id VARCHAR(255),
    n8n_execution_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_user_document FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для documents
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================
-- CONTRACT REVIEWS TABLE
-- ============================================

CREATE TABLE contract_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_file_name VARCHAR(500) NOT NULL,
    original_file_path VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    extracted_text TEXT,
    analysis_result JSONB,
    risk_level risk_severity_enum,
    risks JSONB,
    recommendations JSONB,
    ai_tokens_used INT NOT NULL DEFAULT 0,
    status document_status_enum NOT NULL DEFAULT 'pending',
    error_message TEXT,
    n8n_workflow_id VARCHAR(255),
    n8n_execution_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_user_contract FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для contract_reviews
CREATE INDEX idx_contract_reviews_user_id ON contract_reviews(user_id);
CREATE INDEX idx_contract_reviews_status ON contract_reviews(status);
CREATE INDEX idx_contract_reviews_created_at ON contract_reviews(created_at);
CREATE INDEX idx_contract_reviews_risk_level ON contract_reviews(risk_level);

-- ============================================
-- PAYMENTS TABLE
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    plan_type subscription_plan_enum,
    transaction_id VARCHAR(255),
    external_payment_id VARCHAR(255),
    payment_url VARCHAR(1000),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_user_payment FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- ============================================
-- REQUEST LOGS TABLE
-- ============================================

CREATE TABLE request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_data JSONB,
    response_status INT,
    response_data JSONB,
    ai_tokens_used INT NOT NULL DEFAULT 0,
    ip_address INET,
    user_agent VARCHAR(500),
    execution_time_ms INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_log FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Индексы для request_logs
CREATE INDEX idx_request_logs_user_id ON request_logs(user_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX idx_request_logs_endpoint ON request_logs(endpoint);

-- Партиционирование по месяцам (опционально для больших объёмов)
-- CREATE TABLE request_logs_y2026m04 PARTITION OF request_logs
--     FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_notification FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- API KEYS TABLE (для тарифа Pro/Enterprise)
-- ============================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    rate_limit_per_minute INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_api_key FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для api_keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash) UNIQUE;
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- SEO ARTICLES TABLE
-- ============================================

CREATE TABLE seo_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_articles_slug ON seo_articles(slug);

-- ============================================
-- SINGLE PURCHASES TABLE
-- ============================================

CREATE TABLE single_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_single_purchases_user_id ON single_purchases(user_id);
CREATE INDEX idx_single_purchases_status ON single_purchases(status);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON usage_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_articles_updated_at BEFORE UPDATE ON seo_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA: USAGE LIMITS FOR NEW USERS
-- ============================================

CREATE OR REPLACE FUNCTION create_initial_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usage_limits (
        user_id,
        plan_type,
        max_documents,
        max_contracts
    ) VALUES (
        NEW.id,
        'free',
        5,
        3
    );
    
    INSERT INTO subscriptions (
        user_id,
        plan_type,
        status
    ) VALUES (
        NEW.id,
        'free',
        'active'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_initial_usage_limits_after_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_usage_limits();

-- ============================================
-- VIEWS
-- ============================================

-- Представление: Активные пользователи с подпиской
CREATE VIEW active_users_with_subscriptions AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.user_type,
    s.plan_type,
    s.status,
    s.end_date,
    ul.documents_generated,
    ul.contracts_reviewed,
    ul.max_documents,
    ul.max_contracts
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN usage_limits ul ON u.id = ul.user_id
WHERE u.is_active = true AND s.status = 'active';

-- Представление: Статистика использования
CREATE VIEW usage_statistics AS
SELECT 
    u.id AS user_id,
    u.email,
    s.plan_type,
    COUNT(DISTINCT d.id) AS total_documents,
    COUNT(DISTINCT cr.id) AS total_contracts,
    SUM(d.ai_tokens_used) AS total_document_tokens,
    SUM(cr.ai_tokens_used) AS total_contract_tokens
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN documents d ON u.id = d.user_id
LEFT JOIN contract_reviews cr ON u.id = cr.user_id
GROUP BY u.id, u.email, s.plan_type;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Пользователи платформы';
COMMENT ON TABLE subscriptions IS 'Подписки пользователей';
COMMENT ON TABLE usage_limits IS 'Лимиты использования для каждого пользователя';
COMMENT ON TABLE documents IS 'Сгенерированные документы';
COMMENT ON TABLE contract_reviews IS 'Результаты проверки договоров';
COMMENT ON TABLE payments IS 'Платежи и транзакции';
COMMENT ON TABLE request_logs IS 'Логи запросов к API';
COMMENT ON TABLE notifications IS 'Уведомления для пользователей';
COMMENT ON TABLE api_keys IS 'API ключи для интеграций';
