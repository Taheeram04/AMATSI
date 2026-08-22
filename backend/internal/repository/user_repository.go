package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kijanifarmer/backend/internal/models"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, full_name, phone_number, COALESCE(email, ''), COALESCE(password_hash, ''),
		       COALESCE(language, 'en'), COALESCE(sms_enabled, true), is_premium, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	user := &models.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.FullName,
		&user.PhoneNumber,
		&user.Email,
		&user.PasswordHash,
		&user.Language,
		&user.SMSEnabled,
		&user.IsPremium,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByPhone(ctx context.Context, phone string) (*models.User, error) {
	query := `
		SELECT id, full_name, phone_number, COALESCE(email, ''), COALESCE(password_hash, ''),
		       COALESCE(language, 'en'), COALESCE(sms_enabled, true), is_premium, created_at, updated_at
		FROM users
		WHERE phone_number = $1
	`
	user := &models.User{}
	err := r.db.QueryRow(ctx, query, phone).Scan(
		&user.ID,
		&user.FullName,
		&user.PhoneNumber,
		&user.Email,
		&user.PasswordHash,
		&user.Language,
		&user.SMSEnabled,
		&user.IsPremium,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, user *models.User) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Ensure auth.users row exists for FK (local/demo Supabase schema).
	if _, err := tx.Exec(ctx, `INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING`, user.ID, user.Email); err != nil {
		return err
	}

	query := `
		INSERT INTO users (id, full_name, phone_number, email, password_hash, language, sms_enabled)
		VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6, $7)
		RETURNING created_at, updated_at, is_premium
	`
	if err := tx.QueryRow(ctx, query,
		user.ID,
		user.FullName,
		user.PhoneNumber,
		user.Email,
		user.PasswordHash,
		user.Language,
		user.SMSEnabled,
	).Scan(&user.CreatedAt, &user.UpdatedAt, &user.IsPremium); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID string, fullName, email, language string, smsEnabled bool) (*models.User, error) {
	query := `
		UPDATE users
		SET full_name = $2, email = NULLIF($3, ''), language = $4, sms_enabled = $5, updated_at = timezone('utc'::text, now())
		WHERE id = $1
		RETURNING id, full_name, phone_number, COALESCE(email, ''), COALESCE(password_hash, ''), COALESCE(language, 'en'), sms_enabled, is_premium, created_at, updated_at
	`
	user := &models.User{}
	err := r.db.QueryRow(ctx, query, userID, fullName, email, language, smsEnabled).Scan(
		&user.ID,
		&user.FullName,
		&user.PhoneNumber,
		&user.Email,
		&user.PasswordHash,
		&user.Language,
		&user.SMSEnabled,
		&user.IsPremium,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) UpdatePasswordHash(ctx context.Context, userID, passwordHash string) error {
	query := `
		UPDATE users SET password_hash = $2, updated_at = timezone('utc'::text, now()) WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, userID, passwordHash)
	return err
}
