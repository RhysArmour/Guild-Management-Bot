import {
  Model,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  InferAttributes,
  ModelStatic,
  CreationAttributes,
  Attributes,
  WhereOptions,
  InferCreationAttributes,
} from 'sequelize';
import { Logger } from '../../logger';

export class BaseRepository<M extends Model<InferAttributes<M>, InferCreationAttributes<M>>> {
  protected Model!: ModelStatic<M>;

  // Global default FindOptions
  private static readonly defaultFindOptions: FindOptions = {
    nest: true,
  };

  constructor(Model: ModelStatic<M>) {
    this.Model = Model;
  }

  /**
   * Create a new record
   * @param data - Data object to create
   * @param options - Sequelize create options
   */
  async create(data: CreationAttributes<M>, options?: CreateOptions): Promise<M> {
    try {
      Logger.info(`Creating a new record in ${this.Model.name}`, JSON.stringify(data));
      const result = await this.Model.create(data, options);
      Logger.info(`Successfully created a new record in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      console.error(error);
      Logger.error(`Error creating a new record in ${this.Model.name}`, JSON.stringify(error));
      throw error;
    }
  }

  /**
   * Find a single record by criteria
   * @param criteria - Where conditions for the query
   * @param options - Sequelize find options
   */
  async findOneByCriteria(criteria: WhereOptions<Attributes<M>>, options?: FindOptions<M>): Promise<M | null> {
    try {
      Logger.info(`Finding a single record by criteria in ${this.Model.name} ${JSON.stringify(criteria)}`);
      const mergedOptions = { ...BaseRepository.defaultFindOptions, ...options };
      const result = await this.Model.findOne({ where: { ...criteria }, ...mergedOptions });
      if (!result) {
        Logger.warn(`No record found by criteria in ${this.Model.name}`, { criteria });
        return null;
      }
      Logger.info(`Successfully found a single record by criteria in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      Logger.error(
        `Error finding a single record by criteria in ${this.Model.name} ${JSON.stringify(criteria)}:`,
        JSON.stringify(error),
      );
      throw error;
    }
  }

  /**
   * Find all records matching criteria
   * @param criteria - Where conditions for the query
   * @param options - Sequelize find options
   */
  async findAll(criteria?: WhereOptions<Attributes<M>>, options?: FindOptions<M>): Promise<M[]> {
    try {
      Logger.info(`Finding all records by criteria in ${this.Model.name}`, { criteria });
      const mergedOptions = { ...BaseRepository.defaultFindOptions, ...options };
      const result = await this.Model.findAll({ ...criteria, ...mergedOptions });
      Logger.info(`Successfully found all records by criteria in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      Logger.error(`Error finding all records by criteria in ${this.Model.name}`, { criteria, error });
      throw error;
    }
  }

  /**
   * Find a single record by primary key
   * @param id - The primary key value
   * @param options - Sequelize find options
   */
  async findById(id: string | bigint | number, options?: FindOptions<InferAttributes<M>>): Promise<M | null> {
    try {
      Logger.info(`Finding record by ID in ${this.Model.name}`, { id });
      const mergedOptions = { ...BaseRepository.defaultFindOptions, ...options };
      const result = await this.Model.findByPk(id, mergedOptions);
      if (!result) {
        Logger.warn(`No record found by ID in ${this.Model.name}`, { id });
        return null;
      }
      Logger.info(`Successfully found record by ID in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      Logger.error(`Error finding record by ID in ${this.Model.name}`, { id, error });
      throw error;
    }
  }

  /**
   * Update records matching criteria
   * @param data - Data object to update
   * @param options - Sequelize update options
   */
  async update(data: Partial<Attributes<M>>, options: UpdateOptions): Promise<[number]> {
    try {
      Logger.info(`Updating records in ${this.Model.name}`, { data });
      const result = await this.Model.update(data, options);
      Logger.info(`Successfully updated records in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      Logger.error(`Error updating records in ${this.Model.name}`, { data, error });
      throw error;
    }
  }

  /**
   * Delete records matching criteria
   * @param criteria - Criteria for deletion
   * @param options - Sequelize destroy options
   */
  async delete(criteria: WhereOptions<InferAttributes<M>>, options?: DestroyOptions): Promise<number> {
    try {
      Logger.info(`Deleting records in ${this.Model.name}`, { criteria });
      const result = await this.Model.destroy({ where: criteria, ...options });
      Logger.info(`Successfully deleted records in ${this.Model.name}`, { result });
      return result;
    } catch (error) {
      Logger.error(`Error deleting records in ${this.Model.name}`, { criteria, error });
      throw error;
    }
  }
}
